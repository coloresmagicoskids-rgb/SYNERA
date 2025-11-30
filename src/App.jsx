// src/App.jsx
import React, { useEffect, useState } from "react";
import SplashScreen from "./screens/SplashScreen.jsx";
import AuthScreen from "./screens/AuthScreen.jsx";
import SetupAvatarScreen from "./screens/SetupAvatarScreen.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import ContactsScreen from "./screens/ContactsScreen.jsx";
import SendSensationScreen from "./screens/SendSensationScreen.jsx";
import InboxScreen from "./screens/InboxScreen.jsx";
import { supabase } from "./supabase/supabaseClient.js";

// "splash" -> "auth" -> "setup-avatar" -> "home" -> "contacts" / "send" / "inbox"
function App() {
  const [stage, setStage] = useState("splash");
  const [user, setUser] = useState(null);

  // Lista de contactos (ahora con phone)
  const [contacts, setContacts] = useState([
    {
      id: "demo-1",
      alias: "Luz Serena",
      email: "luz@demo.com",
      phone: "+18091111111",
      avatar_color: "#4f46e5",
    },
    {
      id: "demo-2",
      alias: "Vibra Alta",
      email: "vibra@demo.com",
      phone: "+18092222222",
      avatar_color: "#fb923c",
    },
  ]);

  const [sensations, setSensations] = useState([]);

  // 🔁 Sincronizar usuario, sensaciones y contactos
  useEffect(() => {
    if (!user || !supabase) return;
    if (!user.phone && !user.email) return; // necesitamos algo para identificar

    const keyPhone = user.phone || null;
    const keyEmail = user.email || null;

    const syncUserAndData = async () => {
      try {
        // 1) Guardar/actualizar usuario básico
        await supabase.from("synera_users").upsert(
          {
            email: keyEmail,
            phone: keyPhone,
            alias: user.alias,
            avatar_color: user.avatar_color || "#a45cff",
          },
          {
            // Si tiene phone, usamos phone como "conflicto".
            // Si aún no tiene phone, usamos email.
            onConflict: keyPhone ? "phone" : "email",
          }
        );

        // 2) Cargar sensaciones donde esté involucrado
        let sensQuery = supabase.from("synera_sensations").select("*");

        if (keyPhone) {
          sensQuery = sensQuery.or(
            `sender_phone.eq.${keyPhone},receiver_phone.eq.${keyPhone}`
          );
        } else if (keyEmail) {
          sensQuery = sensQuery.or(
            `sender_email.eq.${keyEmail},receiver_email.eq.${keyEmail}`
          );
        }

        sensQuery = sensQuery.order("created_at", { ascending: false });

        const { data: sensData, error: sensError } = await sensQuery;

        if (!sensError && sensData) {
          setSensations(sensData);
        }

        // 3) Cargar contactos del usuario
        let contactsQuery = supabase.from("synera_contacts").select("*");

        if (keyPhone) {
          contactsQuery = contactsQuery.eq("owner_phone", keyPhone);
        } else if (keyEmail) {
          contactsQuery = contactsQuery.eq("owner_email", keyEmail);
        }

        contactsQuery = contactsQuery.order("created_at", {
          ascending: true,
        });

        const { data: contactData, error: contactError } =
          await contactsQuery;

        if (!contactError && contactData && contactData.length > 0) {
          setContacts(
            contactData.map((c) => ({
              id: c.id,
              alias: c.contact_alias,
              email: c.contact_email,
              phone: c.contact_phone,
              avatar_color: c.avatar_color || "#22c55e",
            }))
          );
        }
      } catch (err) {
        console.error("Error sincronizando con Supabase", err);
      }
    };

    syncUserAndData();
  }, [user]);

  // 🔔 Realtime: escuchar nuevas sensaciones para este usuario
  useEffect(() => {
    if (!user || !supabase) return;
    if (!user.phone && !user.email) return;

    const keyPhone = user.phone || null;
    const keyEmail = user.email || null;

    // Elegimos qué filtro usar
    let filter = "";
    if (keyPhone) {
      filter = `receiver_phone=eq.${keyPhone}`;
    } else if (keyEmail) {
      filter = `receiver_email=eq.${keyEmail}`;
    } else {
      return;
    }

    const channel = supabase
      .channel("synera_sensations_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "synera_sensations",
          filter,
        },
        (payload) => {
          console.log("💜 Nueva sensación recibida:", payload);

          const s = payload.new;
          setSensations((prev) => [
            {
              id: s.id,
              sender_email: s.sender_email,
              sender_phone: s.sender_phone,
              receiver_email: s.receiver_email,
              receiver_phone: s.receiver_phone,
              intensity: s.intensity,
              note: s.note,
              label: s.label,
              color: s.color,
              created_at: s.created_at,
            },
            ...prev,
          ]);
        }
      )
      .subscribe((status) => {
        console.log("Estado Realtime SYNERA:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSplashDone = () => setStage("auth");

  const handleAuthSuccess = (userData) => {
    // userData debe traer: alias, email?, phone, avatar_color
    setUser(userData);
    setStage("setup-avatar");
  };

  const handleAvatarConfigured = (updatedUser) => {
    setUser(updatedUser);
    setStage("home");
  };

  const handleOpenContacts = () => setStage("contacts");
  const handleBackFromContacts = () => setStage("home");

  const handleAddContact = async (newContact) => {
    const localId = crypto.randomUUID
      ? crypto.randomUUID()
      : `local-${Date.now()}`;

    const contactObj = {
      ...newContact, // alias, email?, phone, avatar_color
      id: localId,
    };

    setContacts((prev) => [...prev, contactObj]);

    try {
      if (supabase && (user?.phone || user?.email)) {
        await supabase.from("synera_contacts").insert({
          owner_phone: user.phone,
          owner_email: user.email,
          contact_alias: newContact.alias,
          contact_email: newContact.email,
          contact_phone: newContact.phone,
          avatar_color: newContact.avatar_color,
        });
      }
    } catch (err) {
      console.error("Error guardando contacto en Supabase", err);
    }
  };

  const handleOpenSend = () => setStage("send");
  const handleBackFromSend = () => setStage("home");

  const handleSendSensation = async (payload) => {
    const full = {
      ...payload,
      id: crypto.randomUUID ? crypto.randomUUID() : `sens-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setSensations((prev) => [full, ...prev]);
    setStage("home");

    try {
      if (supabase && (user?.phone || user?.email)) {
        await supabase.from("synera_sensations").insert({
          sender_email: full.sender_email || null,
          sender_phone: full.sender_phone || null,
          receiver_email: full.receiver_email || null,
          receiver_phone: full.receiver_phone || null,
          intensity: full.intensity,
          label: full.label,
          color: full.color,
          note: full.note || null,
        });
      }
    } catch (err) {
      console.error("Error guardando sensación en Supabase", err);
    }
  };

  const handleOpenInbox = () => setStage("inbox");
  const handleBackFromInbox = () => setStage("home");

  if (stage === "splash") {
    return <SplashScreen onFinish={handleSplashDone} />;
  }

  if (stage === "auth") {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  if (stage === "setup-avatar") {
    return <SetupAvatarScreen user={user} onDone={handleAvatarConfigured} />;
  }

  if (stage === "contacts") {
    return (
      <ContactsScreen
        user={user}
        contacts={contacts}
        onAddContact={handleAddContact}
        onBack={handleBackFromContacts}
      />
    );
  }

  if (stage === "send") {
    return (
      <SendSensationScreen
        user={user}
        contacts={contacts}
        onBack={handleBackFromSend}
        onSend={handleSendSensation}
      />
    );
  }

  if (stage === "inbox") {
    return (
      <InboxScreen
        user={user}
        sensations={sensations}
        onBack={handleBackFromInbox}
      />
    );
  }

  return (
    <HomeScreen
      user={user}
      onOpenContacts={handleOpenContacts}
      onOpenSend={handleOpenSend}
      onOpenInbox={handleOpenInbox}
      lastSensation={sensations[0] || null}
    />
  );
}

export default App;

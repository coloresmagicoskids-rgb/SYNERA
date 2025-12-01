// src/App.jsx
import React, { useEffect, useState } from "react";
import SplashScreen from "./screens/SplashScreen.jsx";
import AuthScreen from "./screens/AuthScreen.jsx";
import SetupAvatarScreen from "./screens/SetupAvatarScreen.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import ContactsScreen from "./screens/ContactsScreen.jsx";
import SendSensationScreen from "./screens/SendSensationScreen.jsx";
import InboxScreen from "./screens/InboxScreen.jsx";
import LinksScreen from "./screens/LinksScreen.jsx"; // 🆕 VÍNCULOS
import { supabase } from "./supabase/supabaseClient.js";

// "splash" -> "auth" -> "setup-avatar" -> "home" -> "contacts" / "send" / "inbox" / "links"
function App() {
  const [stage, setStage] = useState("splash");
  const [user, setUser] = useState(null);

  const [contacts, setContacts] = useState([
    {
      id: "demo-1",
      alias: "Luz Serena",
      email: "luz@demo.com",
      avatar_color: "#4f46e5",
    },
    {
      id: "demo-2",
      alias: "Vibra Alta",
      email: "vibra@demo.com",
      avatar_color: "#fb923c",
    },
  ]);

  const [sensations, setSensations] = useState([]);

  // 🔁 Sincronización con Supabase cuando haya usuario
  useEffect(() => {
    if (!user || !supabase || !user.email) return;

    const syncUserAndData = async () => {
      try {
        // 1) Usuario básico
        await supabase.from("synera_users").upsert(
          {
            email: user.email,
            alias: user.alias,
            avatar_color: user.avatar_color || "#a45cff",
          },
          { onConflict: "email" }
        );

        // 2) Sensaciones donde participa
        const { data: sensData, error: sensError } = await supabase
          .from("synera_sensations")
          .select("*")
          .or(
            `sender_email.eq.${user.email},receiver_email.eq.${user.email}`
          )
          .order("created_at", { ascending: false });

        if (!sensError && sensData) {
          setSensations(sensData);
        }

        // 3) Contactos del usuario
        const { data: contactData, error: contactError } = await supabase
          .from("synera_contacts")
          .select("*")
          .eq("owner_email", user.email)
          .order("created_at", { ascending: true });

        if (!contactError && contactData && contactData.length > 0) {
          setContacts(
            contactData.map((c) => ({
              id: c.id,
              alias: c.contact_alias,
              email: c.contact_email,
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
    if (!user || !supabase || !user.email) return;

    const channel = supabase
      .channel("synera_sensations_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "synera_sensations",
          filter: `receiver_email=eq.${user.email}`,
        },
        (payload) => {
          console.log("💜 Nueva sensación recibida:", payload);
          const newSens = payload.new;

          setSensations((prev) => [
            {
              id: newSens.id,
              sender_email: newSens.sender_email,
              receiver_email: newSens.receiver_email,
              intensity: newSens.intensity,
              note: newSens.note,
              label: newSens.label,
              created_at: newSens.created_at,
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

  // ---- Handlers de flujo ----
  const handleSplashDone = () => setStage("auth");

  const handleAuthSuccess = (userData) => {
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
    const contactObj = { ...newContact, id: localId };
    setContacts((prev) => [...prev, contactObj]);

    try {
      if (supabase && user?.email) {
        await supabase.from("synera_contacts").insert({
          owner_email: user.email,
          contact_alias: newContact.alias,
          contact_email: newContact.email,
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
      if (supabase && user?.email) {
        await supabase.from("synera_sensations").insert({
          sender_email: full.sender_email,
          receiver_email: full.receiver_email,
          intensity: full.intensity,
          note: full.note || null,
          label: full.label,
          color: full.color,
        });
      }
    } catch (err) {
      console.error("Error guardando sensación en Supabase", err);
    }
  };

  const handleOpenInbox = () => setStage("inbox");
  const handleBackFromInbox = () => setStage("home");

  // 🆕 VÍNCULOS
  const handleOpenLinks = () => setStage("links");
  const handleBackFromLinks = () => setStage("home");

  // ---- Render por etapa ----
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

  if (stage === "links") {
    return (
      <LinksScreen
        user={user}
        onBack={handleBackFromLinks}
        sensations={sensations}
        contacts={contacts}
      />
    );
  }

  // Home por defecto
  return (
    <HomeScreen
      user={user}
      onOpenContacts={handleOpenContacts}
      onOpenSend={handleOpenSend}
      onOpenInbox={handleOpenInbox}
      onOpenLinks={handleOpenLinks} // 🆕 pasa el handler
      lastSensation={sensations[0] || null}
    />
  );
}

export default App;

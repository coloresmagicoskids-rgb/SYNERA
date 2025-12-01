// src/App.jsx
import React, { useEffect, useState } from "react";
import SplashScreen from "./screens/SplashScreen.jsx";
import AuthScreen from "./screens/AuthScreen.jsx";
import SetupAvatarScreen from "./screens/SetupAvatarScreen.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import ContactsScreen from "./screens/ContactsScreen.jsx";
import SendSensationScreen from "./screens/SendSensationScreen.jsx";
import InboxScreen from "./screens/InboxScreen.jsx";
import LinksScreen from "./screens/LinksScreen.jsx"; // 🔹 NUEVO
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

  // 🔗 NUEVO: estado de vínculos
  const [links, setLinks] = useState([]);

  // 🔁 Sincronizar usuario + datos desde Supabase
  useEffect(() => {
    if (!user || !supabase || !user.email) return;

    const syncUserAndData = async () => {
      try {
        // 1) Guardar/actualizar usuario básico
        await supabase.from("synera_users").upsert(
          {
            email: user.email,
            alias: user.alias,
            avatar_color: user.avatar_color || "#a45cff",
          },
          { onConflict: "email" }
        );

        // 2) Cargar sensaciones donde esté involucrado
        const { data: sensData, error: sensError } = await supabase
          .from("synera_sensations")
          .select("*")
          .or(`sender_email.eq.${user.email},receiver_email.eq.${user.email}`)
          .order("created_at", { ascending: false });

        if (!sensError && sensData) {
          setSensations(sensData);
        }

        // 3) Cargar contactos del usuario (si los hay)
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

        // 4) 🔗 Cargar vínculos
        const { data: linksData, error: linksError } = await supabase
          .from("synera_links")
          .select("*")
          .eq("owner_email", user.email)
          .order("bond_level", { ascending: false });

        if (!linksError && linksData) {
          setLinks(linksData);
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
              color: newSens.color,
              sender_alias: newSens.sender_alias,
              receiver_alias: newSens.receiver_alias,
              created_at: newSens.created_at,
            },
            ...prev,
          ]);
        }
      )
      .subscribe((status) => {
        console.log("Estado Realtime SYNERA:", status);
      });

    // Limpieza al cambiar de usuario o desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSplashDone = () => setStage("auth");

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setStage("setup-avatar");
  };

  const handleAvatarConfigured = (updatedUser) => {
    setUser(updatedUser);
    setStage("home");
  };

  // CONTACTOS
  const handleOpenContacts = () => setStage("contacts");
  const handleBackFromContacts = () => setStage("home");

  const handleAddContact = async (newContact) => {
    const localId = crypto.randomUUID
      ? crypto.randomUUID()
      : `local-${Date.now()}`;

    const contactObj = {
      ...newContact,
      id: localId,
    };

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

  // ENVIAR SENSACIÓN
  const handleOpenSend = () => setStage("send");
  const handleBackFromSend = () => setStage("home");

  const handleSendSensation = async (payload) => {
    const full = {
      ...payload,
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : `sens-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setSensations((prev) => [full, ...prev]);
    setStage("home");

    try {
      if (supabase && user?.email) {
        await supabase.from("synera_sensations").insert({
          sender_email: full.sender_email,
          sender_alias: full.sender_alias,
          receiver_email: full.receiver_email,
          receiver_alias: full.receiver_alias,
          color: full.color,
          intensity: full.intensity,
          label: full.label,
        });
      }
    } catch (err) {
      console.error("Error guardando sensación en Supabase", err);
    }
  };

  // INBOX
  const handleOpenInbox = () => setStage("inbox");
  const handleBackFromInbox = () => setStage("home");

  // 🔗 VÍNCULOS
  const handleOpenLinks = () => setStage("links");
  const handleBackFromLinks = () => setStage("home");

  const handleAddLink = async (payload) => {
    const localId = crypto.randomUUID
      ? crypto.randomUUID()
      : `link-${Date.now()}`;

    const linkObj = {
      id: localId,
      owner_email: user.email,
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Estado local inmediato
    setLinks((prev) => [linkObj, ...prev]);

    // Guardar en Supabase
    try {
      if (supabase && user?.email) {
        await supabase.from("synera_links").insert({
          owner_email: user.email,
          linked_email: payload.linked_email,
          linked_alias: payload.linked_alias,
          bond_level: payload.bond_level,
          note: payload.note,
          color: payload.color,
        });
      }
    } catch (err) {
      console.error("Error guardando vínculo en Supabase", err);
    }
  };

  const handleUpdateLinkLevel = async (linkId, newLevel) => {
    // Estado local
    setLinks((prev) =>
      prev.map((l) =>
        l.id === linkId ? { ...l, bond_level: newLevel } : l
      )
    );

    // Supabase
    try {
      if (supabase && user?.email) {
        await supabase
          .from("synera_links")
          .update({
            bond_level: newLevel,
            updated_at: new Date().toISOString(),
          })
          .eq("id", linkId)
          .eq("owner_email", user.email);
      }
    } catch (err) {
      console.error("Error actualizando vínculo en Supabase", err);
    }
  };

  // FLUJO DE PANTALLAS
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
        contacts={contacts}
        links={links}
        onAddLink={handleAddLink}
        onUpdateLevel={handleUpdateLinkLevel}
        onBack={handleBackFromLinks}
      />
    );
  }

  // HOME
  return (
    <HomeScreen
      user={user}
      onOpenContacts={handleOpenContacts}
      onOpenSend={handleOpenSend}
      onOpenInbox={handleOpenInbox}
      onOpenLinks={handleOpenLinks} // 🔹 NUEVO
      lastSensation={sensations[0] || null}
    />
  );
}

export default App;
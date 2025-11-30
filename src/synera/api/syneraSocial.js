// src/synera/api/syneraSocial.js
// Pequeña capa de ayuda para hablar con Supabase
// Tablas usadas: synera_users, synera_contacts, synera_sensations

import { supabase } from "../../supabase/supabaseClient.js";

/**
 * Guarda o actualiza un usuario de SYNERA.
 * Usa el email como identificador único.
 */
export async function upsertUser({ email, alias, avatarColor }) {
  if (!email) throw new Error("upsertUser: falta email");

  const { data, error } = await supabase
    .from("synera_users")
    .upsert(
      {
        email,
        alias: alias || email,
        avatar_color: avatarColor || "#a45cff",
      },
      { onConflict: "email" }
    )
    .select()
    .single();

  if (error) throw error;
  return data; // fila completa de synera_users
}

/**
 * Añade un contacto para un usuario dueño (ownerEmail).
 */
export async function addContact({
  ownerEmail,
  contactAlias,
  contactEmail,
  avatarColor,
}) {
  if (!ownerEmail) throw new Error("addContact: falta ownerEmail");
  if (!contactEmail) throw new Error("addContact: falta contactEmail");

  const { data, error } = await supabase
    .from("synera_contacts")
    .insert({
      owner_email: ownerEmail,
      contact_alias: contactAlias || contactEmail,
      contact_email: contactEmail,
      avatar_color: avatarColor || "#22c55e",
    })
    .select()
    .single();

  if (error) throw error;

  // Lo devolvemos ya en el formato que usa la UI
  return {
    id: data.id,
    alias: data.contact_alias,
    email: data.contact_email,
    avatar_color: data.avatar_color || "#22c55e",
  };
}

/**
 * Lista todos los contactos de un usuario concreto.
 */
export async function listContacts(ownerEmail) {
  if (!ownerEmail) throw new Error("listContacts: falta ownerEmail");

  const { data, error } = await supabase
    .from("synera_contacts")
    .select("*")
    .eq("owner_email", ownerEmail)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data || []).map((c) => ({
    id: c.id,
    alias: c.contact_alias,
    email: c.contact_email,
    avatar_color: c.avatar_color || "#22c55e",
  }));
}

/**
 * Envía una sensación de un correo a otro.
 * Usa la tabla synera_sensations.
 */
export async function sendSensation({
  senderEmail,
  receiverEmail,
  intensity = "media",
  note = "ánimo",
}) {
  if (!senderEmail) throw new Error("sendSensation: falta senderEmail");
  if (!receiverEmail) throw new Error("sendSensation: falta receiverEmail");

  const { data, error } = await supabase
    .from("synera_sensations")
    .insert({
      sender_email: senderEmail,
      receiver_email: receiverEmail,
      intensity,
      note,
    })
    .select()
    .single();

  if (error) throw error;

  // Adaptamos al formato que usa la app en memoria
  return {
    id: data.id,
    sender_email: data.sender_email,
    receiver_email: data.receiver_email,
    intensity: data.intensity,
    label: data.note || "ánimo",
    color: "#a855f7",
    created_at: data.created_at,
  };
}

/**
 * Lista todas las sensaciones donde participe un correo
 * (como emisor o receptor).
 */
export async function listSensationsFor(email) {
  if (!email) throw new Error("listSensationsFor: falta email");

  const { data, error } = await supabase
    .from("synera_sensations")
    .select("*")
    .or(`sender_email.eq.${email},receiver_email.eq.${email}`)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((s) => ({
    id: s.id,
    sender_email: s.sender_email,
    receiver_email: s.receiver_email,
    intensity: s.intensity,
    label: s.note || "ánimo",
    color: "#a855f7",
    created_at: s.created_at,
  }));
}

/**
 * Suscribirse a sensaciones entrantes para un email.
 * callback(newSensation) se ejecuta cada vez que llega una nueva.
 *
 * Devuelve una función unsubscribe() para cortar la suscripción.
 */
export function subscribeToIncomingSensations(email, callback) {
  if (!email) throw new Error("subscribeToIncomingSensations: falta email");

  const channel = supabase
    .channel("synera_sensations_realtime")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "synera_sensations",
        filter: `receiver_email=eq.${email}`,
      },
      (payload) => {
        const s = payload.new;
        const normalized = {
          id: s.id,
          sender_email: s.sender_email,
          receiver_email: s.receiver_email,
          intensity: s.intensity,
          label: s.note || "ánimo",
          color: "#a855f7",
          created_at: s.created_at,
        };
        callback(normalized);
      }
    )
    .subscribe((status) => {
      console.log("Estado realtime SYNERA:", status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
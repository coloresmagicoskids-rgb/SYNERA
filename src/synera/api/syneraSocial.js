// src/synera-api/syneraSocial.js
import { supabase } from "../supabaseClient";

/* -------------------------
   AUTENTICACIÓN UTIL
-------------------------- */

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw error || new Error("No hay usuario logueado");
  return user;
}

/* -------------------------
   BÚSQUEDA DE USUARIOS
-------------------------- */

// Buscar usuario por email o alias
export async function findUserByEmailOrAlias({ email, alias }) {
  let query = supabase.from("profiles").select("id, alias, email");

  if (email) {
    query = query.ilike("email", email);
  } else if (alias) {
    query = query.ilike("alias", alias);
  } else {
    throw new Error("Debes proporcionar email o alias");
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data; // { id, alias, email } | null
}

/* -------------------------
   CONTACTOS
-------------------------- */

// Enviar solicitud de contacto
export async function sendContactRequest(friendId) {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      user_id: user.id,
      friend_id: friendId,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Aceptar solicitud de contacto
export async function acceptContact(contactId) {
  const { data, error } = await supabase
    .from("contacts")
    .update({ status: "accepted" })
    .eq("id", contactId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Listar contactos aceptados (tus amigos)
export async function listContacts() {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("contacts")
    .select(
      `
      id,
      status,
      friend:friend_id (
        id,
        alias,
        email
      )
    `
    )
    .eq("user_id", user.id)
    .eq("status", "accepted");

  if (error) throw error;
  return data || [];
}

/* -------------------------
   SENSACIONES
-------------------------- */

export async function sendSensation({ receiverId, intensity }) {
  const user = await getCurrentUser();

  // 1) Guardar sensación
  const { data: sensation, error } = await supabase
    .from("sensations")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      intensity, // 'soft' | 'medium' | 'high'
    })
    .select()
    .single();

  if (error) throw error;

  // 2) Crear notificación para el receptor
  const notify = await supabase.from("notifications").insert({
    user_id: receiverId,
    type: "sensation",
    data: {
      from_id: user.id,
      intensity,
      created_at: new Date().toISOString(),
    },
  });

  if (notify.error) {
    console.warn("No se pudo crear notificación de sensación:", notify.error);
  }

  return sensation;
}

// Historial de sensaciones (enviadas y recibidas)
export async function listMySensations() {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("sensations")
    .select(
      `
      id,
      intensity,
      created_at,
      sender:sender_id ( id, alias, email ),
      receiver:receiver_id ( id, alias, email )
    `
    )
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/* -------------------------
   MENSAJES DE TEXTO
-------------------------- */

// Enviar mensaje a un usuario
export async function sendMessage({ receiverId, content }) {
  const user = await getCurrentUser();

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content,
    })
    .select()
    .single();

  if (error) throw error;

  // Notificación para el receptor
  const notify = await supabase.from("notifications").insert({
    user_id: receiverId,
    type: "message",
    data: {
      from_id: user.id,
      preview: content.slice(0, 80),
      created_at: new Date().toISOString(),
    },
  });

  if (notify.error) {
    console.warn("No se pudo crear notificación de mensaje:", notify.error);
  }

  return message;
}

// Obtener conversación con una persona concreta
export async function getConversationWith(otherUserId) {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      id,
      content,
      created_at,
      sender_id,
      receiver_id
    `
    )
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

/* -------------------------
   NOTIFICACIONES
-------------------------- */

// Listar mis notificaciones (no leídas primero)
export async function listNotifications() {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, data, created_at, read")
    .eq("user_id", user.id)
    .order("read", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// Marcar una notificación como leída
export async function markNotificationRead(id) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

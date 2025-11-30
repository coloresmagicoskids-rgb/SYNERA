// src/synera/api/syneraSocial.js
import { supabase } from "../../supabaseClient";

/**
 * Pequeño helper para obtener el usuario autenticado
 * Lanza error si no hay sesión.
 */
async function getCurrentUserOrThrow() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("No hay usuario autenticado");

  return user;
}

/**
 * Buscar usuario por email o alias
 * - Usa la tabla "profiles" (id, alias, email)
 * - Retorna un único usuario o null si no existe
 */
export async function findUserByEmailOrAlias({ email, alias }) {
  let query = supabase.from("profiles").select("id, alias, email");

  if (email) {
    query = query.ilike("email", email); // búsqueda sin distinción de mayúsculas
  } else if (alias) {
    query = query.ilike("alias", alias);
  } else {
    throw new Error("Debes proporcionar email o alias");
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data; // { id, alias, email } o null
}

/**
 * Crear / enviar solicitud de contacto
 * - Crea un registro en la tabla "contacts"
 * - status: "pending" por defecto
 */
export async function sendContactRequest(friendId) {
  const user = await getCurrentUserOrThrow();

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

/**
 * Aceptar una solicitud de contacto
 * - Actualiza el contacto a status = "accepted"
 */
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

/**
 * Obtener todos mis contactos aceptados
 * - Devuelve filas de la tabla "contacts"
 * - Incluye contactos donde soy user_id o friend_id
 * - status = "accepted"
 */
export async function getMyContacts() {
  const user = await getCurrentUserOrThrow();

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .eq("status", "accepted")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Enviar una sensación a un contacto
 * - Usa la tabla "sensations"
 * - intensity: "suave" | "media" | "alta"
 * - message: opcional, por si luego quieres agregar texto
 */
export async function sendSensation({ receiverId, intensity, message }) {
  const user = await getCurrentUserOrThrow();

  const { data, error } = await supabase
    .from("sensations")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      intensity,
      message: message || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtener el historial de sensaciones con otra persona
 * - Puedes usarlo para mostrar un historial entre tú y tu esposa
 */
export async function getSensationsWithContact(otherUserId) {
  const user = await getCurrentUserOrThrow();

  const { data, error } = await supabase
    .from("sensations")
    .select("*")
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}
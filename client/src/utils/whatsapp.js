export function onlyDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

export function whatsappUrl(phone, message) {
  const digits = onlyDigits(phone);
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits || "5493815551234"}?text=${text}`;
}

export function appointmentMessage(appointment, intro = "Hola, quiero confirmar mi turno") {
  const date = new Date(appointment.date).toLocaleDateString("es-AR", { timeZone: "UTC" });
  return `${intro}: ${appointment.service.name} el ${date} a las ${appointment.time} con ${appointment.barber.name}.`;
}

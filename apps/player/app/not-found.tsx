const NotFound = () => (
  <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
    <h1 className="text-2xl font-bold">Enlace no válido</h1>
    <p className="mt-2 text-muted-foreground">
      Este enlace no existe o ha sido desactivado. Contacta con tu cuerpo
      técnico para obtener tu enlace personal.
    </p>
  </div>
);

export default NotFound;

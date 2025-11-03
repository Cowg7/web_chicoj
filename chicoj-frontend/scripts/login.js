// Script de login con integración a la API

(() => {
  const $ = (id) => document.getElementById(id);
  const form = $("form-login");
  const usuario = $("usuario");
  const password = $("password");
  const msg = $("msg");

  function setError(text = "") {
    if (msg) {
      msg.textContent = text;
      if (text) {
        msg.classList.add('show');
      } else {
        msg.classList.remove('show');
      }
    }
  }

  function setLoading(loading) {
    const btn = form?.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = loading;
      if (loading) {
        btn.classList.add('loading');
        btn.textContent = 'Ingresando';
      } else {
        btn.classList.remove('loading');
        btn.textContent = 'Ingresar';
      }
    }
  }

  // Mapeo de roles a rutas
  const ROLE_REDIRECTS = {
    administrador: "/main",
    admin: "/main",
    gerente: "/templates/reportes/reportes",
    cajero: "/templates/caja/caja",
    mesero: "/templates/mesero/mesero_comanda",
    tour: "/templates/tour/tour",
    cocina: "/templates/cocina/cocina?area=Cocina",
    bebidas: "/templates/cocina/cocina?area=Bebidas",
    coffee: "/templates/cocina/cocina?area=Coffee"
  };

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      setError("");

      const user = (usuario.value || "").trim();
      const pass = (password.value || "").trim();

      if (!user || !pass) {
        setError("Completa usuario y contraseña.");
        return;
      }

      setLoading(true);

      try {
        // Intentar login con la API
        const response = await API.auth.login(user, pass);

        // El backend envía: { success: true, data: { user, token } }
        const data = response.data || response;
        const token = data.token || response.token;
        const userData = data.user || response.user;

        if (token && userData) {
          // Guardar token
          AuthManager.setToken(token);
          
          // Guardar datos de usuario
          AuthManager.setUser(userData);

          // Redirigir según el rol
          const role = userData.rol || userData.role || 'admin';
          const redirect = ROLE_REDIRECTS[role.toLowerCase()] || "/main";
          
          window.location.href = redirect;
        } else {
          setError("Credenciales incorrectas.");
        }
      } catch (error) {
        console.error('Error en login:', error);
        setError(error.message || "Error al iniciar sesión. Verifica tus credenciales.");
      } finally {
        setLoading(false);
      }
    });

    // Enter en password envía el formulario
    if (password) {
      password.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") form.requestSubmit();
      });
    }
  }
})();

// Script de login con integración a la API y seguridad mejorada

(() => {
  const $ = (id) => document.getElementById(id);
  const form = $("form-login");
  const usuario = $("usuario");
  const password = $("password");
  const msg = $("msg");

  // Sistema de seguridad contra fuerza bruta
  const SECURITY_CONFIG = {
    MAX_ATTEMPTS: 5,              // Máximo intentos antes de bloquear
    LOCKOUT_DURATION: 15 * 60000, // 15 minutos en milisegundos
    ATTEMPT_WINDOW: 5 * 60000     // Ventana de 5 minutos para contar intentos
  };

  // Obtener datos de seguridad del localStorage
  function getSecurityData() {
    try {
      const data = localStorage.getItem('login_security');
      return data ? JSON.parse(data) : { attempts: 0, lockedUntil: null, lastAttempt: null };
    } catch {
      return { attempts: 0, lockedUntil: null, lastAttempt: null };
    }
  }

  // Guardar datos de seguridad
  function saveSecurityData(data) {
    localStorage.setItem('login_security', JSON.stringify(data));
  }

  // Verificar si está bloqueado
  function isLocked() {
    const security = getSecurityData();
    if (security.lockedUntil && Date.now() < security.lockedUntil) {
      const remainingMinutes = Math.ceil((security.lockedUntil - Date.now()) / 60000);
      return { locked: true, remainingMinutes };
    }
    return { locked: false };
  }

  // Registrar intento fallido
  function recordFailedAttempt() {
    const security = getSecurityData();
    const now = Date.now();
    
    // Si pasó la ventana de tiempo, resetear intentos
    if (security.lastAttempt && (now - security.lastAttempt) > SECURITY_CONFIG.ATTEMPT_WINDOW) {
      security.attempts = 0;
    }
    
    security.attempts++;
    security.lastAttempt = now;
    
    // Si excede el máximo, bloquear
    if (security.attempts >= SECURITY_CONFIG.MAX_ATTEMPTS) {
      security.lockedUntil = now + SECURITY_CONFIG.LOCKOUT_DURATION;
      saveSecurityData(security);
      return { locked: true, attempts: security.attempts };
    }
    
    saveSecurityData(security);
    return { locked: false, attempts: security.attempts };
  }

  // Resetear intentos después de login exitoso
  function resetSecurity() {
    localStorage.removeItem('login_security');
  }

  // Sanitizar input (prevenir XSS)
  function sanitizeInput(input) {
    return input.trim()
      .replace(/[<>]/g, '')  // Remover < >
      .replace(/['"]/g, '')  // Remover comillas
      .slice(0, 50);         // Limitar longitud
  }

  function setError(text = "", type = 'error') {
    if (msg) {
      msg.textContent = text;
      if (text) {
        msg.classList.add('show');
        msg.style.background = type === 'warning' ? '#FFF3CD' : '#ffebee';
        msg.style.color = type === 'warning' ? '#856404' : '#c62828';
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
        btn.textContent = 'Verificando';
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

  // Validar en tiempo real
  if (usuario) {
    usuario.addEventListener('input', (e) => {
      const value = e.target.value;
      // Validar longitud y caracteres permitidos
      if (value.length > 0 && value.length < 3) {
        e.target.style.borderColor = '#F59E0B';
      } else if (value.length >= 3) {
        e.target.style.borderColor = '#10B981';
      } else {
        e.target.style.borderColor = '';
      }
    });
  }

  if (password) {
    password.addEventListener('input', (e) => {
      const value = e.target.value;
      if (value.length > 0 && value.length < 8) {
        e.target.style.borderColor = '#F59E0B';
      } else if (value.length >= 8) {
        e.target.style.borderColor = '#10B981';
      } else {
        e.target.style.borderColor = '';
      }
    });
  }

  // Verificar bloqueo al cargar la página
  const lockStatus = isLocked();
  if (lockStatus.locked) {
    setError(`🔒 Cuenta bloqueada temporalmente por seguridad. Espera ${lockStatus.remainingMinutes} minuto(s) e intenta nuevamente.`, 'warning');
    setLoading(true); // Deshabilitar botón
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      setError("");

      // Verificar si está bloqueado
      const lockStatus = isLocked();
      if (lockStatus.locked) {
        setError(`🔒 Cuenta bloqueada por seguridad. Espera ${lockStatus.remainingMinutes} minuto(s) antes de intentar nuevamente.`, 'warning');
        Toast.warning(`Demasiados intentos fallidos. Cuenta bloqueada por ${lockStatus.remainingMinutes} minuto(s)`);
        return;
      }

      // Sanitizar inputs
      const user = sanitizeInput(usuario.value || "");
      const pass = sanitizeInput(password.value || "");

      // Validaciones básicas
      if (!user || !pass) {
        setError("⚠️ Completa usuario y contraseña.");
        return;
      }

      if (user.length < 3) {
        setError("⚠️ El usuario debe tener al menos 3 caracteres.");
        usuario.focus();
        return;
      }

      if (pass.length < 8) {
        setError("⚠️ La contraseña debe tener al menos 8 caracteres.");
        password.focus();
        return;
      }

      setLoading(true);

      try {
        console.log('[AUTH] Intentando login...');
        
        // Intentar login con la API
        const response = await API.auth.login(user, pass);

        // El backend envía: { success: true, data: { user, token } }
        const data = response.data || response;
        const token = data.token || response.token;
        const userData = data.user || response.user;

        if (token && userData) {
          console.log('[OK] Login exitoso');
          
          // Resetear contador de intentos
          resetSecurity();
          
          // Guardar token
          AuthManager.setToken(token);
          
          // Guardar datos de usuario
          AuthManager.setUser(userData);

          // Mostrar éxito
          Toast.success('¡Bienvenido! Redirigiendo...');

          // Redirigir según el rol
          const role = userData.rol || userData.role || 'admin';
          const redirect = ROLE_REDIRECTS[role.toLowerCase()] || "/main";
          
          setTimeout(() => {
            window.location.href = redirect;
          }, 500);
        } else {
          throw new Error('Credenciales incorrectas');
        }
      } catch (error) {
        console.error('[ERROR] Error en login:', error);
        
        // Registrar intento fallido
        const attemptResult = recordFailedAttempt();
        
        if (attemptResult.locked) {
          setError(`🔒 Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente por ${Math.ceil(SECURITY_CONFIG.LOCKOUT_DURATION / 60000)} minutos por seguridad.`, 'warning');
          Toast.error('Cuenta bloqueada por seguridad');
          setLoading(true); // Mantener botón deshabilitado
        } else {
          const remainingAttempts = SECURITY_CONFIG.MAX_ATTEMPTS - attemptResult.attempts;
          setError(`❌ Usuario o contraseña incorrectos. Intentos restantes: ${remainingAttempts}`);
          
          if (remainingAttempts <= 2) {
            Toast.warning(`⚠️ Solo te quedan ${remainingAttempts} intento(s) antes del bloqueo`);
          }
        }
        
        // Limpiar contraseña por seguridad
        password.value = '';
        password.focus();
      } finally {
        if (!isLocked().locked) {
          setLoading(false);
        }
      }
    });

    // Enter en password envía el formulario
    if (password) {
      password.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") form.requestSubmit();
      });
    }
  }
  
  console.log('[OK] Sistema de login con seguridad mejorada iniciado');
})();

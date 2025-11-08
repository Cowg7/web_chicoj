# Cómo Resolver el Error de Git Pull

## Opción 1: Guardar tus cambios locales (Recomendado)

Si tienes cambios importantes en `nginx/conf.d/default.conf` que quieres conservar:

```bash
cd /opt/chicoj

# 1. Ver qué cambios tienes localmente
git diff nginx/conf.d/default.conf

# 2. Guardar los cambios en stash
git stash push -m "Cambios locales de nginx config" nginx/conf.d/default.conf

# 3. Hacer pull
git pull origin main

# 4. (Opcional) Restaurar tus cambios después del pull
git stash pop
```

**⚠️ Si `git stash pop` muestra conflictos**, tendrás que resolverlos manualmente editando el archivo.

## Opción 2: Descartar cambios locales

Si tus cambios locales no son importantes y quieres usar la versión del repositorio:

```bash
cd /opt/chicoj

# 1. Descartar cambios locales
git checkout -- nginx/conf.d/default.conf

# 2. Hacer pull
git pull origin main
```

## Opción 3: Usar el script automatizado

Si tienes el script `scripts/resolve-git-pull.sh` en el servidor:

```bash
chmod +x scripts/resolve-git-pull.sh
./scripts/resolve-git-pull.sh
```

## Recomendación

**Opción 1 es la más segura** porque preserva tus cambios. Después del pull, si necesitas tus cambios locales de vuelta, puedes usar `git stash pop` y revisar si hay conflictos para resolverlos manualmente.



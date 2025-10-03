# Étape 1 : build du projet
FROM node:20-alpine AS build

WORKDIR /app

# Copier les dépendances
COPY package*.json ./
RUN npm install --frozen-lockfile

# Copier le code source
COPY . .

# Build en mode production
RUN npm run build

# Étape 2 : serveur web Nginx
FROM nginx:alpine

# Supprimer config par défaut et ajouter la nôtre
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés dans le répertoire servi par Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

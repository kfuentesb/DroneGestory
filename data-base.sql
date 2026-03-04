CREATE TABLE operadora (
   id_operadora SERIAL PRIMARY KEY,
   nombre VARCHAR(150) NOT NULL,
   id_fidscal INTEGER,
   num_operadora INTEGER,
   codigo_secreto_rid INTEGER,
   path_certificado_easa TEXT,
   path_certificado_no_easa TEXT,
   direccion VARCHAR(255),
   cod_postal INTEGER,
   poblacion VARCHAR(150),
   provincia VARCHAR(150),
   email VARCHAR(150),
   num_telefono BIGINT
);

CREATE TABLE usuario (
     id_usuario SERIAL PRIMARY KEY,
     id_operadora INTEGER NOT NULL,
     nombre VARCHAR(100),
     apellidos VARCHAR(150),
     nombre_usuario VARCHAR(100) UNIQUE,
     password TEXT NOT NULL,
     correo VARCHAR(150) UNIQUE,
     num_telefono BIGINT,
     path_imagen TEXT,
     CONSTRAINT fk_usuario_operadora
         FOREIGN KEY (id_operadora)
             REFERENCES operadora(id_operadora)
             ON DELETE CASCADE
);

CREATE TABLE piloto (
    id_piloto SERIAL PRIMARY KEY,
    id_operadora INTEGER NOT NULL,
    id_usuario INTEGER UNIQUE,
    CONSTRAINT fk_piloto_operadora
        FOREIGN KEY (id_operadora)
            REFERENCES operadora(id_operadora)
            ON DELETE CASCADE,
    CONSTRAINT fk_piloto_usuario
        FOREIGN KEY (id_usuario)
            REFERENCES usuario(id_usuario)
            ON DELETE CASCADE
);

CREATE TABLE certificacion (
   id_certificacion SERIAL PRIMARY KEY,
   nombre VARCHAR(150) NOT NULL,
   tipo VARCHAR(100)
);

CREATE TABLE habilitacion_nm (
     id_piloto INTEGER NOT NULL,
     id_certificacion INTEGER NOT NULL,
     fecha_alta DATE,
     fecha_caducidad DATE,
     PRIMARY KEY (id_piloto, id_certificacion),
     CONSTRAINT fk_hab_piloto
         FOREIGN KEY (id_piloto)
             REFERENCES piloto(id_piloto)
             ON DELETE CASCADE,
     CONSTRAINT fk_hab_certificacion
         FOREIGN KEY (id_certificacion)
             REFERENCES certificacion(id_certificacion)
             ON DELETE CASCADE
);

CREATE TABLE aseguradora (
     id_seguro SERIAL PRIMARY KEY,
     nombre VARCHAR(150) NOT NULL,
     fecha_comienzo DATE,
     fecha_caducidad DATE,
     importe BIGINT
);

CREATE TABLE aeronave (
      id_aeronave SERIAL PRIMARY KEY,
      id_operadora INTEGER NOT NULL,
      id_seguro INTEGER,
      nombre VARCHAR(150),
      num_serie INTEGER,
      estado VARCHAR(100),
      fabricante VARCHAR(150),
      modelo VARCHAR(150),
      path_imagen TEXT,
      fecha_compra DATE,
      CONSTRAINT fk_aeronave_operadora
          FOREIGN KEY (id_operadora)
              REFERENCES operadora(id_operadora)
              ON DELETE CASCADE,
      CONSTRAINT fk_aeronave_seguro
          FOREIGN KEY (id_seguro)
              REFERENCES aseguradora(id_seguro)
              ON DELETE SET NULL
);


CREATE TABLE operacion (
   id_operacion SERIAL PRIMARY KEY,
   id_piloto INTEGER NOT NULL,
   id_aeronave INTEGER NOT NULL,
   fecha_realizacion DATE,
   estado VARCHAR(100),
   categoria VARCHAR(100),
   CONSTRAINT fk_operacion_piloto
       FOREIGN KEY (id_piloto)
           REFERENCES piloto(id_piloto)
           ON DELETE CASCADE,
   CONSTRAINT fk_operacion_aeronave
       FOREIGN KEY (id_aeronave)
           REFERENCES aeronave(id_aeronave)
           ON DELETE CASCADE
);
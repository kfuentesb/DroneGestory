DROP TABLE IF EXISTS operadora CASCADE;
DROP TABLE IF EXISTS aeronave CASCADE;
DROP TABLE IF EXISTS certificacion CASCADE;
DROP TABLE IF EXISTS habilitacion_nm CASCADE;
DROP TABLE IF EXISTS aseguradora CASCADE;
DROP TABLE IF EXISTS operacion CASCADE;
DROP TABLE IF EXISTS piloto CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;

CREATE TABLE operadora (
   id_operadora SERIAL PRIMARY KEY,
   nombre VARCHAR(150) NOT NULL,
   id_fiscal INTEGER,
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
   path_imagen TEXT
);

CREATE TABLE piloto (
   id_piloto SERIAL PRIMARY KEY,
   id_operadora INTEGER NOT NULL,
   id_usuario INTEGER UNIQUE
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
   PRIMARY KEY (id_piloto, id_certificacion)
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
   fecha_compra DATE
);


CREATE TABLE operacion (
   id_operacion SERIAL PRIMARY KEY,
   id_piloto INTEGER NOT NULL,
   id_aeronave INTEGER NOT NULL,
   fecha_realizacion DATE,
   estado VARCHAR(100),
   categoria VARCHAR(100)
);

ALTER TABLE usuario ADD FOREIGN KEY (id_operadora) REFERENCES operadora(id_operadora) ON DELETE CASCADE;

ALTER TABLE piloto ADD FOREIGN KEY (id_operadora) REFERENCES operadora(id_operadora) ON DELETE CASCADE;
ALTER TABLE piloto ADD FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE;

ALTER TABLE habilitacion_nm ADD FOREIGN KEY (id_piloto) REFERENCES piloto(id_piloto) ON DELETE CASCADE;
ALTER TABLE habilitacion_nm ADD FOREIGN KEY (id_certificacion) REFERENCES certificacion(id_certificacion) ON DELETE CASCADE;

ALTER TABLE aeronave ADD FOREIGN KEY (id_operadora) REFERENCES operadora(id_operadora) ON DELETE CASCADE;
ALTER TABLE aeronave ADD FOREIGN KEY (id_seguro) REFERENCES aseguradora(id_seguro) ON DELETE CASCADE;

ALTER TABLE operacion ADD FOREIGN KEY (id_piloto) REFERENCES piloto(id_piloto) ON DELETE CASCADE;
ALTER TABLE aeronave ADD FOREIGN KEY (id_aeronave) REFERENCES aeronave(id_aeronave) ON DELETE CASCADE;

\dt
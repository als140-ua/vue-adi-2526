// pb.js
import PocketBase from "pocketbase";

// Crear una única instancia (singleton)
export const pb = new PocketBase("http://127.0.0.1:8090");

export const SUPERUSER = {
  email: "superuser@ua.es",
  password: "superuser1"
};
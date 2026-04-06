import { Redirect } from "expo-router";
import React from "react";
import { useAuth } from "../src/providers/AuthProvider";

export default function Index() {
  const { session } = useAuth();

  return <Redirect href={session ? "/program" : "/sign-in"} />;
}

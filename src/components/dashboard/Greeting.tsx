"use client";

import React, { useState, useEffect } from "react";

export function Greeting() {
  const [greeting, setGreeting] = useState("Good evening");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return <h1 className="text-3xl font-bold tracking-tight">{greeting}.</h1>;
}

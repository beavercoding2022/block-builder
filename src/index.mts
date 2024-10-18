#!/usr/bin/env node

import { Args, Command, Options } from "@effect/cli";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Console, Effect, Option } from "effect";

// Define a text argument
const text = Args.text({ name: "text" });

// Define the 'bold' option with an alias '-b'
const bold = Options.boolean("bold").pipe(Options.withAlias("b"));

// Define the 'color' option with choices and an alias '-c'
const color = Options.choice("color", ["red", "green", "blue"]).pipe(
  Options.withAlias("c"),
  Options.optional
);

// Color codes for ANSI escape sequences
const colorCodes = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
} as any;
const resetCode = "\x1b[0m";

// Function to apply ANSI color codes based on user input
const applyColor = (text: string, color: Option.Option<string>): string =>
  Option.match(color, {
    onNone: () => text,
    onSome: (color) => `${colorCodes[color]}${text}${resetCode}`,
  });

// Create the command that outputs formatted text
const command = Command.make(
  "echo",
  { text, bold, color },
  ({ bold, color, text }) => {
    let formattedText = applyColor(text, color);
    if (bold) {
      formattedText = `\x1b[1m${formattedText}\x1b[0m`;
    }
    return Console.log(formattedText);
  }
);

const cli = Command.run(command, {
  name: "Echo CLI",
  version: "v0.0.3",
});

cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain);

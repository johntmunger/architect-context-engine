# Architect IDE Bridge for VS Code

The Architect IDE Bridge connects Visual Studio Code to the local
[Architect](https://github.com/johntmunger/architect) CLI.

It provides an IDE workflow for opening a repository and launching
Architect operations from VS Code.

Architect remains the core runtime. The bridge is an optional companion
that adds VS Code integration.

## What This Project Does

The bridge is responsible for:

- Integrating Architect with VS Code.
- Providing the `architect open` workflow.
- Opening a repository in VS Code.
- Connecting the VS Code workflow to the local Architect CLI.
- Keeping IDE-specific behavior separate from the core Architect runtime.

The core Architect CLI remains responsible for operations such as:

- `architect crawl`
- `architect chat`
- `architect watch`

The bridge does not replace Architect. It provides an IDE entry point
for using it.

## Prerequisites

Before using the bridge, make sure the following are installed:

- Node.js
- npm
- Visual Studio Code
- Architect

Architect should already be installed and available globally through the
active Node/npm environment.

From a terminal, verify that Architect is available:

    architect --help

You should also be able to run Architect commands from a repository:

    architect crawl

If Architect is not installed yet, follow the installation instructions
in the main Architect repository before continuing.

## Installation

Clone the bridge repository:

    git clone https://github.com/johntmunger/architect-ide-vscode.git

Change into the project directory:

    cd architect-ide-vscode

Install dependencies:

    npm install

## Build

Build the bridge project:

    npm run build

The build command compiles the project into its distribution output.

After making source changes, rebuild the project before testing the
updated bridge behavior.

## Running the Bridge

Start the bridge using the project’s development command:

    npm run dev

If the project uses a different start command in its `package.json`,
use the command defined there.

Keep the bridge process running while using the VS Code integration.

## VS Code Setup

Open the bridge project in VS Code:

    code .

If the bridge is implemented as a VS Code extension, use the VS Code
extension development workflow provided by the project.

Typical extension development steps are:

1. Open the bridge repository in VS Code.
2. Install the project dependencies.
3. Build the project.
4. Start the extension development host or launch configuration.
5. Test the Architect command from the development host.

The exact launch configuration is defined by the bridge project’s VS Code
configuration files.

## Using Architect from Another Repository

Architect operates on the repository from which it is invoked.

The Architect installation does not need to be inside the target
repository.

For example, Architect may be installed in its own development directory:

    ~/Code/architect

A separate repository may be located at:

    ~/Code/project-a

The bridge allows the target repository to be opened through VS Code
while Architect remains installed separately.

The important relationship is:

    VS Code
        |
        v
    Architect IDE Bridge
        |
        v
    Architect CLI
        |
        v
    Target Repository

## The `architect open` Workflow

The bridge adds the `architect open` workflow.

The intended flow is:

1. Open a terminal.
2. Navigate to the target repository.
3. Run the Architect open command.
4. Allow the bridge to open the repository in VS Code.
5. Use Architect from the resulting IDE workflow.

Example:

    cd ~/Code/project-a
    architect open

The `architect open` command is bridge-specific.

The following core commands do not require the IDE bridge:

    architect crawl
    architect chat
    architect watch

## Core CLI vs. IDE Bridge

Architect and the bridge have separate responsibilities.

### Architect

Architect provides the core developer CLI and runtime.

Its responsibilities include:

- Repository context.
- Repository crawling.
- Chat operations.
- Watch operations.
- Runtime behavior.
- Core command execution.

### IDE Bridge

The bridge provides the VS Code integration layer.

Its responsibilities include:

- VS Code integration.
- Opening repositories.
- Launching the IDE workflow.
- Connecting VS Code actions to Architect.
- IDE-specific configuration and behavior.

The bridge is optional. Architect can be installed and used without it.

## Development Workflow

After changing bridge source code:

1. Save the source changes.
2. Run the project build.
3. Restart any running bridge or extension process.
4. Test the workflow from the target repository.
5. Confirm that VS Code opens the expected repository.
6. Confirm that the Architect CLI remains available.

A running process may need to be restarted before it loads newly built
code.

## Troubleshooting

### Architect command not found

If the terminal reports that `architect` cannot be found, verify that:

- Architect is installed.
- The correct Node version is active.
- npm is using the expected environment.
- The global npm binary directory is on the PATH.
- Architect was linked successfully.

Verify the command location:

    which architect

Then verify the CLI:

    architect --help

### npm permission error

If npm reports an `EACCES` permission error, check whether npm is using
a root-owned system directory such as:

    /usr/local

A user-owned Node/npm environment through NVM is recommended.

Avoid using:

    sudo npm link

Instead, activate the intended NVM-managed Node version and run the
installation or linking commands again.

### Changes are not appearing

If changes do not appear after editing the bridge:

1. Run the build again.
2. Restart the bridge process.
3. Restart the VS Code extension development host if applicable.
4. Confirm that the updated distribution files were generated.

### `architect open` does not work

Verify that:

- Architect is installed and available.
- The bridge dependencies are installed.
- The bridge has been built.
- The bridge process or extension host is running.
- The command is being run from the intended repository.
- VS Code is installed and available on the system.

Test Architect independently first:

    architect --help
    architect crawl

If the core CLI works but `architect open` does not, the issue is likely
within the IDE bridge workflow.

## Project Relationship

The projects are intended to be used together:

    architect
        |
        | core CLI and runtime
        v
    architect-ide-vscode
        |
        | optional VS Code integration
        v
    Visual Studio Code

Architect is the core project.

The IDE Bridge is a companion project that adds VS Code-specific behavior.

## Status

This project is under active development.

Commands, launch configurations, and implementation details may change
as the bridge evolves.

Refer to the project source and configuration files for the current
development workflow.
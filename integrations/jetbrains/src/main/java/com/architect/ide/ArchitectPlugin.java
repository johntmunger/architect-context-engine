package com.architect.ide;

import com.intellij.openapi.Disposable;
import com.intellij.openapi.application.ApplicationManager;
import com.intellij.openapi.components.Service;
import com.intellij.openapi.fileEditor.FileEditorManager;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.openapi.vfs.LocalFileSystem;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.IOException;
import java.net.StandardProtocolFamily;
import java.net.UnixDomainSocketAddress;
import java.nio.channels.Channels;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;

@Service(Service.Level.PROJECT)
public final class ArchitectPlugin implements Disposable {

    private final Project project;

    private ServerSocketChannel serverChannel;
    private Path socketPath;
    private Thread serverThread;

    public ArchitectPlugin(Project project) {
        this.project = project;
    }

    public void start() {
        String workspace = project.getBasePath();

        if (workspace == null || workspace.isBlank()) {
            return;
        }

        try {
            Path architectDirectory = Paths.get(
                    System.getProperty("user.home"),
                    ".architect"
            );

            Files.createDirectories(architectDirectory);

            String hash = sha256(workspace).substring(0, 16);
            Path path = architectDirectory.resolve("ide-" + hash + ".sock");

            Files.deleteIfExists(path);

            ServerSocketChannel server =
                    ServerSocketChannel.open(StandardProtocolFamily.UNIX);

            server.bind(UnixDomainSocketAddress.of(path));

            serverChannel = server;
            socketPath = path;

            serverThread = new Thread(
                    () -> listen(server, workspace),
                    "architect-ide-socket"
            );

            serverThread.setDaemon(true);
            serverThread.start();

            System.out.println("Architect IDE listening on " + path);

        } catch (Exception exception) {
            exception.printStackTrace();
        }
    }

    private void listen(
            ServerSocketChannel server,
            String workspace
    ) {
        while (!project.isDisposed() && server.isOpen()) {
            try {
                SocketChannel client = server.accept();
                handleClient(client, workspace);
            } catch (Exception exception) {
                if (server.isOpen()) {
                    exception.printStackTrace();
                }
            }
        }
    }

    private void handleClient(
            SocketChannel client,
            String workspace
    ) {
        try (client) {
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(
                            Channels.newInputStream(client),
                            StandardCharsets.UTF_8
                    )
            );

            String request = reader.lines()
                    .reduce("", (left, right) -> left + right);

            String action = jsonString(request, "action");
            String requestedWorkspace = jsonString(request, "workspace");
            String requestedPath = jsonString(request, "path");

            boolean valid =
                    "open".equals(action) &&
                    workspace.equals(requestedWorkspace) &&
                    requestedPath != null &&
                    !requestedPath.isBlank();

            if (!valid) {
                writeResponse(client, "{\"ok\":false}");
                return;
            }

            VirtualFile file = LocalFileSystem
                    .getInstance()
                    .refreshAndFindFileByPath(requestedPath);

            if (file == null) {
                writeResponse(client, "{\"ok\":false}");
                return;
            }

            ApplicationManager.getApplication().invokeLater(() -> {
                if (!project.isDisposed()) {
                    FileEditorManager
                            .getInstance(project)
                            .openFile(file, true);
                }
            });

            writeResponse(
                    client,
                    "{\"ok\":true,\"workspace\":" +
                            jsonQuote(workspace) +
                            "}"
            );

        } catch (Exception exception) {
            exception.printStackTrace();
        }
    }

    private void writeResponse(
            SocketChannel client,
            String response
    ) throws IOException {
        OutputStreamWriter writer = new OutputStreamWriter(
                Channels.newOutputStream(client),
                StandardCharsets.UTF_8
        );

        writer.write(response);
        writer.flush();
    }

    private static String jsonString(
            String json,
            String key
    ) {
        String pattern = "\"" + key + "\"";
        int keyIndex = json.indexOf(pattern);

        if (keyIndex < 0) {
            return null;
        }

        int colonIndex = json.indexOf(':', keyIndex);
        int openingQuote = json.indexOf('"', colonIndex + 1);

        if (colonIndex < 0 || openingQuote < 0) {
            return null;
        }

        StringBuilder value = new StringBuilder();
        boolean escaped = false;

        for (int index = openingQuote + 1;
             index < json.length();
             index++) {

            char character = json.charAt(index);

            if (escaped) {
                value.append(switch (character) {
                    case '"' -> '"';
                    case '\\' -> '\\';
                    case 'n' -> '\n';
                    case 'r' -> '\r';
                    case 't' -> '\t';
                    default -> character;
                });

                escaped = false;
            } else if (character == '\\') {
                escaped = true;
            } else if (character == '"') {
                return value.toString();
            } else {
                value.append(character);
            }
        }

        return null;
    }

    private static String jsonQuote(String value) {
        return "\"" +
                value
                        .replace("\\", "\\\\")
                        .replace("\"", "\\\"") +
                "\"";
    }

    private static String sha256(String value)
            throws Exception {
        MessageDigest digest =
                MessageDigest.getInstance("SHA-256");

        byte[] bytes = digest.digest(
                value.getBytes(StandardCharsets.UTF_8)
        );

        StringBuilder result = new StringBuilder();

        for (byte current : bytes) {
            result.append(String.format("%02x", current));
        }

        return result.toString();
    }

    @Override
    public void dispose() {
        try {
            if (serverChannel != null) {
                serverChannel.close();
            }
        } catch (IOException ignored) {
        }

        if (socketPath != null) {
            try {
                Files.deleteIfExists(socketPath);
            } catch (IOException ignored) {
            }
        }

        if (serverThread != null) {
            serverThread.interrupt();
        }
    }
}

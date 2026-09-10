package com.architect.ide;

import com.intellij.openapi.project.Project;
import com.intellij.openapi.startup.StartupActivity;

public final class ArchitectStartupActivity
        implements StartupActivity {

    @Override
    public void runActivity(Project project) {
        ArchitectPlugin service =
                project.getService(ArchitectPlugin.class);

        if (service != null) {
            service.start();
        }
    }
}

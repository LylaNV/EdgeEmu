package pt.inesc.termite.server.commands;

import pt.inesc.termite.server.AVDControllerDriver;
import pt.inesc.termite.server.Command;
import pt.inesc.termite.server.Emulator;
import pt.inesc.termite.server.exceptions.ControllerDriverException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Hashtable;

public class StartApplicationCommand extends Command {

    private AVDControllerDriver AVDController;

    public StartApplicationCommand() {
        super("startapp");
    }

    @Override
    public ArrayList<String> execute(ArrayList<String> msg, AVDControllerDriver AVDController) {
        ArrayList<String> result = new ArrayList<>();
        this.AVDController = AVDController;
        ArrayList<String> emusOnlineName = new ArrayList<>();
        ArrayList<String> appStartTargets = new ArrayList<>();

        if (msg.size() < 2) {
            result.add("Error: Wrong number of arguments");
            return result;
        }

        String appPackage = msg.get(0);
        // LYLA 19/01/2023
        System.out.println("[StartApplicationCommand -> execute -> App package is: " + appPackage);
        //
        msg.remove(0);
        if (appPackage == null || appPackage.length() == 0) {
            result.add("Error: Invalid arguments; appPackage: " + appPackage);
            // LYLA 19/01/2023
            System.out.println("[StartApplicationCommand -> execute -> package is empty");
            //
            return result;
        }

        // refresh emulators instances and port redirection
        AVDController.refreshAllRedirections();

        emusOnlineName = getOnlineEmulatorNames();
        if (emusOnlineName.size() == 0) {
            result.add("Error: All emulators offline");
            // LYLA 19/01/2023
            System.out.println("[StartApplicationCommand -> execute -> All emulators are offline. ");
            //
            return result;
        }

        if (msg.size() == 1 && msg.get(0).equals("all")) {
            appStartTargets.addAll(emusOnlineName);
        } else {
            for (String emuName : msg) {
                if (emusOnlineName.contains(emuName)) {
                    appStartTargets.add(emuName);
                } else {
                    result.add(emuName + ": Failure [Emulator not online]");
                }
            }
        }

        ArrayList<Emulator> emusOnline = AVDController.getEmulatorsInstances();
        Hashtable<Thread, StartApplicationThread> startAppsThreads = new Hashtable<>();

        for (Emulator emulator : emusOnline) {
            if (appStartTargets.contains(emulator.get_name())) {
                StartApplicationThread startAppThread = new StartApplicationThread(emulator.get_name(), emulator.get_port(), appPackage, AVDController);
                Thread t = new Thread(startAppThread);
                t.start();
                startAppsThreads.put(t, startAppThread);
            }
        }

        // wait for the termination of all start app threads
        for (Thread t : startAppsThreads.keySet()) {
            try {
                t.join();
            } catch (InterruptedException e) {
                //e.printStackTrace();
            }
        }

        // Check start apps results
        for (StartApplicationThread appThread : startAppsThreads.values()) {
            // LYLA 19/01/2023
            System.out.println("[StartApplicationCommand -> execute -> App start result is: " + appThread.result);
            //
            result.add(appThread.emuName + ": " + appThread.result);
        }

        return result;
    }

    @Override
    public String cmdSyntax() {
        return "startapp <app_package> [all | <emu1> <...>]";
    }

    @Override
    public String getExplanation() {
        return "Starts app package on all online emulators or only those specified";
    }

    // Helper methods
    private ArrayList<String> getOnlineEmulatorNames() {
        ArrayList<String> names = new ArrayList<>();
        for (Emulator emulator : AVDController.getEmulatorsInstances()) {
            names.add(emulator.get_name());
        }
        return names;
    }

    // Class thread to handle application starts
    private static class StartApplicationThread implements Runnable {

        public String emuName;
        public String result;
        private int mEmuPort;
        private String mAppPackage;
        private AVDControllerDriver AVDController;

        public StartApplicationThread(String name, int emuPort, String appPackage, AVDControllerDriver avd) {
            emuName = name;
            mEmuPort = emuPort;
            mAppPackage = appPackage;
            AVDController = avd;
        }

        @Override
        public void run() {
            //LYLA 23/01/2022
            System.out.println("[StartApplicationCommand -> run() -> $ app is started from StartApplicationCommand class.");
            //
            try {
                result = AVDController.startApp(mEmuPort, mAppPackage);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }
}

declare namespace ui {
    namespace notifications {
        interface NotifyOptions {
            /**
             * Should the notification be permanently displayed until dismissed
             */
            permanent?: boolean;

            /**
             * Whether to localize the message content before displaying it
             */
            localize?: boolean;

            /**
             * Whether to log the message to the console
             */
            console?: boolean;
        }

        /**
         * Display a notification with the "info" type
         * @param message The content of the notification message
         * @param options Notification options passed to the notify function
         */
        export function info(message: string, options?: NotifyOptions): number;

        /**
         * Display a notification with the "warning" type
         * @param message The content of the notification message
         * @param options Notification options passed to the notify function
         */
        export function warn(message: string, options?: NotifyOptions): number;

        /**
         * Display a notification with the "error" type
         * @param message The content of the notification message
         * @param options Notification options passed to the notify function
         */
        export function error(message: string, options?: NotifyOptions): number;
    }
}

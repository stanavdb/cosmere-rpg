import { ConstructorOf } from '@system/types/utils';

// Constants
const PRIMARY_TAB_GROUP = 'primary';

export interface ApplicationTab {
    /**
     * The label to apply to this tab
     */
    label: string;

    /**
     * The index for sorting the tabs
     *
     * @default - One plus the index at which the tab id is encountered in `TABS` multiplied by 10 - (1 + i) * 10
     */
    sortIndex?: number;

    /**
     * An optional icon to show for this tab
     */
    icon?: string;

    /**
     * The tab group for which this tab should be active
     *
     * @default 'primary'
     */
    group?: string;
}

/**
 * Mixin that adds standardized tabs to an ApplicationV2
 */
export function TabsApplicationMixin<
    T extends ConstructorOf<
        // NOTE: Use of any as the mixin doesn't care about the types
        // and we don't want to interfere with the final type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        foundry.applications.api.ApplicationV2<any, any, any>
    >,
>(base: T) {
    return class mixin extends base {
        /**
         * Tabs available for this Application
         */
        public static TABS: Record<string, ApplicationTab> = {};

        public tabGroups: Record<string, string> = {};

        /* --- Context --- */

        public async _prepareContext(
            options: Partial<foundry.applications.api.ApplicationV2.RenderOptions>,
        ) {
            // Get all tab groups used by tabs of this application
            const usedGroups = Object.values(mixin.TABS)
                .map((tab) => tab.group ?? PRIMARY_TAB_GROUP)
                .filter((v, i, self) => self.indexOf(v) === i);

            // Ensure that the used tab groups are set up
            usedGroups.forEach((groupId) => {
                if (!this.tabGroups[groupId]) {
                    this.tabGroups[groupId] = Object.entries(mixin.TABS).find(
                        ([_, tab]) =>
                            (tab.group ?? PRIMARY_TAB_GROUP) === groupId,
                    )![0];
                }
            });

            // Construct tabs
            const tabs = Object.entries(mixin.TABS)
                .map(([tabId, tab], i) => {
                    const active = this.tabGroups.primary === tabId;
                    const cssClass = active ? 'active' : '';

                    return {
                        ...tab,
                        id: tabId,
                        group: tab.group ?? PRIMARY_TAB_GROUP,
                        active,
                        cssClass,
                        sortIndex: tab.sortIndex ?? (1 + i) * 10,
                    };
                })
                .sort((a, b) => a.sortIndex - b.sortIndex);

            // Construct tabs map
            const tabsMap = tabs.reduce(
                (map, tab) => {
                    return {
                        ...map,
                        [tab.id]: tab,
                    };
                },
                {} as Record<string, ApplicationTab>,
            );

            return {
                ...(await super._prepareContext(options)),

                tabs,
                tabsMap,
                tabGroups: this.tabGroups,
                activeTab: this.tabGroups.primary,
            };
        }
    };
}

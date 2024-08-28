import CosmereCombatant from './combatant';

export default class CosmereCombatTracker extends CombatTracker {
    //overrides default tracker template to implement slow/fast buckets and activation button.
    //eslint-disable-next-line -- eslint rules want readonly field
    get template() {
        return 'systems/cosmere-rpg/templates/combat/combat-tracker.hbs';
    }

    //modifies data being sent to the combat tracker template to add turn speed, type and activation status and splitting turns between the initiative phases.
    async getData(
        options?: Partial<ApplicationOptions> | undefined,
    ): Promise<object> {
        const data = (await super.getData(options)) as {
            turns: CosmereTurn[];
            [x: string]: unknown;
        };
        data.turns = data.turns.map((turn) => {
            const combatant: CosmereCombatant =
                this.viewed!.getEmbeddedDocument(
                    'Combatant',
                    turn.id,
                    {},
                ) as CosmereCombatant;
            const newTurn: CosmereTurn = {
                ...turn,
                turnSpeed: combatant.getFlag(
                    'cosmere-rpg',
                    'turnSpeed',
                ) as string,
                type: combatant.actor.type,
                activated: combatant.getFlag(
                    'cosmere-rpg',
                    'activated',
                ) as boolean,
            };
            //strips active player formatting
            newTurn.css = '';
            return newTurn;
        });
        data.fastPlayers = data.turns.filter((turn) => {
            return turn.type == 'character' && turn.turnSpeed == 'fast';
        });
        data.slowPlayers = data.turns.filter((turn) => {
            return turn.type == 'character' && turn.turnSpeed == 'slow';
        });
        data.fastNPC = data.turns.filter((turn) => {
            return turn.type == 'adversary' && turn.turnSpeed == 'fast';
        });
        data.slowNPC = data.turns.filter((turn) => {
            return turn.type == 'adversary' && turn.turnSpeed == 'slow';
        });

        return data;
    }

    override activateListeners(html: JQuery<HTMLElement>): void {
        super.activateListeners(html);
        html.find('.cosmere-turn-speed-control').on(
            'click',
            this._onClickToggleTurnSpeed.bind(this),
        );
        html.find('.cosmere-activate-control').on(
            'click',
            this._onActivateCombatant.bind(this),
        );
    }

    //toggles combatant turn speed on clicking the "fast/slow" text on the combat tracker window
    protected _onClickToggleTurnSpeed(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        const btn = event.currentTarget as HTMLElement;
        const li = btn.closest<HTMLElement>('.combatant')!;
        const combatant: CosmereCombatant = this.viewed!.getEmbeddedDocument(
            'Combatant',
            li.dataset.combatantId!,
            {},
        ) as CosmereCombatant;
        void combatant.toggleTurnSpeed();
    }

    //activates the combatant when clicking the activation icon
    protected _onActivateCombatant(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        const btn = event.currentTarget as HTMLElement;
        const li = btn.closest<HTMLElement>('.combatant')!;
        const combatant: CosmereCombatant = this.viewed!.getEmbeddedDocument(
            'Combatant',
            li.dataset.combatantId!,
            {},
        ) as CosmereCombatant;
        void combatant.setFlag('cosmere-rpg', 'activated', true);
    }

    //toggles combatant turn speed on clicking the "fast/slow" option in the turn tracker context menu
    protected _onContextToggleTurnSpeed(li: JQuery<HTMLElement>) {
        const combatant: CosmereCombatant = this.viewed!.getEmbeddedDocument(
            'Combatant',
            li.data('combatant-id') as string,
            {},
        ) as CosmereCombatant;
        combatant.toggleTurnSpeed();
    }

    //resets combatants activation status to hasn't activated
    protected _onContextResetActivation(li: JQuery<HTMLElement>) {
        const combatant: CosmereCombatant = this.viewed!.getEmbeddedDocument(
            'Combatant',
            li.data('combatant-id') as string,
            {},
        ) as CosmereCombatant;
        void combatant.setFlag('cosmere-rpg', 'activated', false);
    }

    _getEntryContextOptions(): ContextMenuEntry[] {
        const menu: ContextMenuEntry[] = [
            {
                name: 'COSMERE.Combat.ToggleTurn',
                icon: '',
                callback: this._onContextToggleTurnSpeed.bind(this),
            },
            {
                name: 'COSMERE.Combat.ResetActivation',
                icon: '<i class="fas fa-undo"></i>',
                callback: this._onContextResetActivation.bind(this),
            },
        ];
        menu.push(
            ...super
                ._getEntryContextOptions()
                .filter(
                    (i) =>
                        i.name !== 'COMBAT.CombatantReroll' &&
                        i.name !== 'COMBAT.CombatantClear',
                ),
        );
        return menu;
    }
}

interface CosmereTurn {
    id: string;
    css: string;
    pending: number;
    finished: number;
    type?: string;
    turnSpeed?: string;
    activated?: boolean;
}

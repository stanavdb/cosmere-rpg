import { ActorType, TurnSpeed } from '@src/system/types/cosmere';
import { CosmereCombatant } from '@src/system/documents/combatant';

/**
 * Overrides default tracker template to implement slow/fast buckets and combatant activation button.
 */
export class CosmereCombatTracker extends CombatTracker {
    // Note: lint rules wants this to be exposed as a readonly field, but base class implements a getter.
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    override get template() {
        return 'systems/cosmere-rpg/templates/combat/combat-tracker.hbs';
    }

    /**
     *  modifies data being sent to the combat tracker template to add turn speed, type and activation status and splitting turns between the initiative phases.
     */
    override async getData(
        options?: Partial<ApplicationOptions> | undefined,
    ): Promise<object> {
        const data = (await super.getData(options)) as {
            turns: CosmereTurn[];
            fastPlayers: CosmereTurn[];
            slowPlayers: CosmereTurn[];
            fastNPC: CosmereTurn[];
            slowNPC: CosmereTurn[];
        };
        //add combatant type, speed, and activation status to existing turn data.
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
                ) as TurnSpeed,
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

        //split turn data into individual turn "buckets" to separate them in the combat tracker ui
        data.fastPlayers = data.turns.filter((turn) => {
            return (
                turn.type === ActorType.Character &&
                turn.turnSpeed === TurnSpeed.Fast
            );
        });
        data.slowPlayers = data.turns.filter((turn) => {
            return (
                turn.type === ActorType.Character &&
                turn.turnSpeed === TurnSpeed.Slow
            );
        });
        data.fastNPC = data.turns.filter((turn) => {
            return (
                turn.type === ActorType.Adversary &&
                turn.turnSpeed === TurnSpeed.Fast
            );
        });
        data.slowNPC = data.turns.filter((turn) => {
            return (
                turn.type === ActorType.Adversary &&
                turn.turnSpeed === TurnSpeed.Slow
            );
        });

        return data;
    }

    /**
     * add listeners to toggleTurnSpeed and activation buttons
     */
    override activateListeners(html: JQuery<HTMLElement>): void {
        super.activateListeners(html);
        html.find(`[data-control='toggleSpeed']`).on(
            'click',
            this._onClickToggleTurnSpeed.bind(this),
        );
        html.find(`[data-control='activateCombatant']`).on(
            'click',
            this._onActivateCombatant.bind(this),
        );
    }

    /**
     * toggles combatant turn speed on clicking the "fast/slow" button on the combat tracker window
     * */
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

    /**
     *  activates the combatant when clicking the activation button
     */
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

    /**
     * toggles combatant turn speed on clicking the "fast/slow" option in the turn tracker context menu
     */
    protected _onContextToggleTurnSpeed(li: JQuery<HTMLElement>) {
        const combatant: CosmereCombatant = this.viewed!.getEmbeddedDocument(
            'Combatant',
            li.data('combatant-id') as string,
            {},
        ) as CosmereCombatant;
        combatant.toggleTurnSpeed();
    }

    /**
     * resets combatants activation status to hasn't activated
     */
    protected _onContextResetActivation(li: JQuery<HTMLElement>) {
        const combatant: CosmereCombatant = this.viewed!.getEmbeddedDocument(
            'Combatant',
            li.data('combatant-id') as string,
            {},
        ) as CosmereCombatant;
        void combatant.setFlag('cosmere-rpg', 'activated', false);
    }

    /**
     * Overwrites combatants context menu options, adding toggle turn speed and reset activation options. Removes initiative rolling options from base implementation.
     */
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
        //pushes existing context menu options, filtering out the initiative reroll and initiative clear options
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
    type?: ActorType;
    turnSpeed?: TurnSpeed;
    activated?: boolean;
}

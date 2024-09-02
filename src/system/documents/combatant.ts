import { DocumentModificationOptions } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs';
import { SchemaField } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs';
import { CosmereActor } from './actor';
import { ActorType, TurnSpeed } from '@src/system/types/cosmere';

export class CosmereCombatant extends Combatant {
    override get actor(): CosmereActor {
        return super.actor as CosmereActor;
    }

    /**
     * on creation, combatants turn speed is set to slow, activation status to false, and then sets the initiative, bypassing the need to roll
     */
    protected override _onCreate(
        data: SchemaField.InnerAssignmentType<DataSchema>,
        options: DocumentModificationOptions,
        userID: string,
    ) {
        super._onCreate(data, options, userID);
        void this.setFlag('cosmere-rpg', 'turnSpeed', TurnSpeed.Slow);
        void this.setFlag('cosmere-rpg', 'activated', false);
        void this.combat?.setInitiative(
            this.id!,
            this.generateInitiative(this.actor.type, TurnSpeed.Slow),
        );
    }

    /**
     * Utility function to generate initiative without rolling
     * @param type The actor type so that npc's will come after player characters
     * @param speed Whether the combatants is set to take a slow or fast turn
     */
    generateInitiative(type: ActorType, speed: TurnSpeed): number {
        let initiative = this.actor.system.attributes.spd.value;
        if (type === ActorType.Character) initiative += 500;
        if (speed === TurnSpeed.Fast) initiative += 1000;
        return initiative;
    }

    /**
     * Utility function to flip the combatants current turn speed between slow and fast. It then updates initiative to force an update of the combat-tracker ui
     */
    toggleTurnSpeed() {
        const currentSpeed = this.getFlag(
            'cosmere-rpg',
            'turnSpeed',
        ) as TurnSpeed;
        const newSpeed =
            currentSpeed === TurnSpeed.Slow ? TurnSpeed.Fast : TurnSpeed.Slow;
        void this.setFlag('cosmere-rpg', 'turnSpeed', newSpeed);
        void this.combat?.setInitiative(
            this.id!,
            this.generateInitiative(this.actor.type, newSpeed),
        );
    }
}

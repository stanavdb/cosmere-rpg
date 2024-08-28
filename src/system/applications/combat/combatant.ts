import { DocumentModificationOptions } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs';
import { SchemaField } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs';
import { CosmereActor } from '../../documents';

export default class CosmereCombatant extends Combatant {
    //sets actor type to CosmereActor, to get typescript to stop yelling. Might be a better way to do this but I'm newish to TS and don't know how.
    override get actor(): CosmereActor {
        return super.actor as CosmereActor;
    }

    //on creation, combatants turn speed is set to slow, activation status to false, and then sets the initiative, bypassing the need to roll
    protected override _onCreate(
        data: SchemaField.InnerAssignmentType<DataSchema>,
        options: DocumentModificationOptions,
        userID: string,
    ) {
        super._onCreate(data, options, userID);
        void this.setFlag('cosmere-rpg', 'turnSpeed', 'slow');
        void this.setFlag('cosmere-rpg', 'activated', false);
        void this.combat?.setInitiative(
            this.id!,
            this.generateInitiative(this.actor.type, 'slow'),
        );
    }

    generateInitiative(type: string, speed: string): number {
        let initiative: number = this.actor.system.attributes.spd.value;
        if (type == 'character') initiative += 500;
        if (speed == 'fast') initiative += 1000;
        return initiative;
    }

    toggleTurnSpeed() {
        const currentSpeed = this.getFlag('cosmere-rpg', 'turnSpeed') as string;
        const newSpeed = currentSpeed == 'slow' ? 'fast' : 'slow';
        void this.setFlag('cosmere-rpg', 'turnSpeed', newSpeed);
        void this.combat?.setInitiative(
            this.id!,
            this.generateInitiative(this.actor.type, newSpeed),
        );
    }
}

import { DocumentModificationOptions } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs';
import { SchemaField } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs';
import { CosmereActor } from '../../documents';
import { ActorType, TurnSpeed } from '@src/system/types/cosmere';

/**
 *
 */

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
            this.generateInitiative(
                this.actor.type as ActorType,
                TurnSpeed.Slow,
            ),
        );
    }

    generateInitiative(type: ActorType, speed: TurnSpeed): number {
        let initiative: number = this.actor.system.attributes.spd.value;
        if (type == ActorType.Character) initiative += 500;
        if (speed == TurnSpeed.Fast) initiative += 1000;
        return initiative;
    }

    toggleTurnSpeed() {
        const currentSpeed = this.getFlag(
            'cosmere-rpg',
            'turnSpeed',
        ) as TurnSpeed;
        const newSpeed =
            currentSpeed == TurnSpeed.Slow ? TurnSpeed.Fast : TurnSpeed.Slow;
        void this.setFlag('cosmere-rpg', 'turnSpeed', newSpeed);
        void this.combat?.setInitiative(
            this.id!,
            this.generateInitiative(this.actor.type as ActorType, newSpeed),
        );
    }
}

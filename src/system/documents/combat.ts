export class CosmereCombat extends Combat {
    //sets all defeated combatants activation status to true (already activated), and all others to false(hasn't activated yet)
    resetActivations() {
        for (const combatant of this.turns) {
            void combatant.setFlag(
                'cosmere-rpg',
                'activated',
                combatant.isDefeated ? true : false,
            );
        }
    }

    override async startCombat(): Promise<this> {
        this.resetActivations();
        return super.startCombat();
    }

    override async nextRound(): Promise<this | undefined> {
        this.resetActivations();
        return super.nextRound();
    }
}

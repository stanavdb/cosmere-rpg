import { AdversaryActor } from '@system/documents';

// Components
import { AdversaryHeaderComponent } from './components/adversary';

// Base
import { BaseActorSheet, BaseActorSheetRenderContext } from './base';

export type AdversarySheetRenderContext = Omit<
    BaseActorSheetRenderContext,
    'actor'
> & {
    actor: AdversaryActor;
};

export class AdversarySheet extends BaseActorSheet<AdversarySheetRenderContext> {
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {
            classes: ['cosmere-rpg', 'sheet', 'actor', 'adversary'],
            position: {
                width: 850,
                height: 1000,
            },
            dragDrop: [
                {
                    dropSelector: '*',
                },
            ],
        },
    );

    static COMPONENTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.COMPONENTS),
        {
            'app-adversary-header': AdversaryHeaderComponent,
        },
    );

    static PARTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.PARTS),
        {
            'sheet-content': {
                template:
                    'systems/cosmere-rpg/templates/actors/adversary/parts/sheet-content.hbs',
            },
        },
    );

    get actor(): AdversaryActor {
        return super.document;
    }
}

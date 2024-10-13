import { Attribute, Skill } from './cosmere';

export namespace Talent {
    export const enum Type {
        Ancestry = 'ancestry',
        Path = 'path',
    }

    export namespace Prerequisite {
        export const enum Type {
            Talent = 'talent',
            Attribute = 'attribute',
            Skill = 'skill',
            Connection = 'connection',
        }

        export const enum Mode {
            AnyOf = 'any-of',
            AllOf = 'all-of',
        }

        export interface TalentRef {
            /**
             * UUID of the Talent item this prerequisite refers to.
             */
            uuid: string;
            /**
             * The id of the talent
             */
            id: string;
            /**
             * The name of the talent
             */
            label: string;
        }
    }

    interface BasePrerequisite<Type extends Prerequisite.Type> {
        type: Type;
    }

    export interface ConnectionPrerequisite
        extends BasePrerequisite<Prerequisite.Type.Connection> {
        description: string;
    }

    export interface AttributePrerequisite
        extends BasePrerequisite<Prerequisite.Type.Attribute> {
        attribute: Attribute;
        value: number;
    }

    export interface SkillPrerequisite
        extends BasePrerequisite<Prerequisite.Type.Skill> {
        skill: Skill;
        rank: number;
    }

    export interface TalentPrerequisite
        extends BasePrerequisite<Prerequisite.Type.Talent> {
        label?: string;
        talents: Prerequisite.TalentRef[];
        mode: Prerequisite.Mode;
    }

    export type Prerequisite =
        | ConnectionPrerequisite
        | AttributePrerequisite
        | SkillPrerequisite
        | TalentPrerequisite;
}

/**
 * @typedef {import('@league-of-foundry-developers/foundry-vtt-types/src/foundry/client-esm/dice/_types.d.mts').RollParseNode} RollParseNode
 * @typedef {import('@league-of-foundry-developers/foundry-vtt-types/src/foundry/client-esm/dice/_types.d.mts').RollTerm} RollTerm
 */

interface RollEvaluationOptions {
    /**
     * Minimize the result, obtaining the smallest possible value.
     * @default false
     */
    minimize?: boolean;

    /**
     * Maximize the result, obtaining the largest possible value.
     * @default false
     */
    maximize?: boolean;

    /**
     * Throw an Error if the Roll contains non-deterministic terms that
     * cannot be evaluated synchronously. If this is set to false,
     * non-deterministic terms will be ignored.
     * @default true
     */
    strict?: boolean;

    /**
     * If true, string terms will not cause an error to be thrown during
     * evaluation.
     * @default false
     */
    allowStrings?: boolean;
}

declare interface Roll<D extends Record<string, unknown> = {}> {
    new(formula: string, data?: object, options?: object);

    /**
     * The original provided data object which substitutes into attributes of the roll formula.
     */
    data: D;

    /**
     * Options which modify or describe the Roll
     */
    options: object;

    /**
     * The identified terms of the Roll
     */
    terms: RollTerm[];

    /**
     * An array of inner DiceTerms that were evaluated as part of the Roll evaluation
     * @internal
     */
    _dice: RollTerm[];

    /**
     * Store the original cleaned formula for the Roll, prior to any internal evaluation or simplification
     */
    _formula: string;

    /**
     * Track whether this Roll instance has been evaluated or not. Once evaluated the Roll is immutable.
     * @internal
     */
    _evaluated: boolean;

    /**
     * Cache the numeric total generated through evaluation of the Roll.
     */
    _total: number;

    /**
     * A reference to the Roll at the root of the evaluation tree.
     */
    _root: Roll;

    /**
     * A reference to the RollResolver app being used to externally resolve this Roll.
     */
    _resolver: unknown;

    /**
     * Return the arbitrary product of evaluating this Roll.
     */
    get product(): any;

    /**
     * Execute the Roll synchronously, replacing dice and evaluating the total result.
     * @returns The evaluated Roll instance.
     */
    evaluateSync(options?: RollEvaluationOptions): Roll;

    _evaluateASTAsync(node: RollParseNode | RollTerm, options?: Omit<RollEvaluationOptions, 'strict'>): Promise<string | number>;
    _evaluateASTSync(node: RollParseNode | RollTerm, options?: Omit<RollEvaluationOptions, 'strict'>): string | number;

    /**
     * Propagate flavor text across all terms that do not have any.
     * @param flavor The flavor text.
     */
    propagateFlavor(flavor: string);

    toMessage<
        T extends DeepPartial<ChatMessage.MessageData> = Record<
            string,
            unknown
        >
    >(
        messageData: T,
        options: { rollMode?: keyof CONFIG.Dice.RollModes | 'roll'; create?: boolean }
    ): Promise<ChatMessage.ConfiguredInstance | undefined> | ChatMessage.MessageData | undefined;
}   
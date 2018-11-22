export { InputStateMachine, Rule };

// A state machine to handle sequences of input keys
class InputStateMachine {
    /** @param {Rule[]} rules */
    constructor(rules) {
        this.rules = rules;
        // Current state in the case of multi-key input sequences.
        this.current = {
            ruleSet: rules,
            keySequence: [],
            context: null
        }
    }

    // Evaluate a single key according to current state.
    // If the key matches no rules, reset the state.
    // Otherwise, if the key matches a [sub-]rule, transition to its state.
    // If the new state defines an action, invoke the action with the context accumulated so far.
    // If the new state has no further child rules, finish by resetting the state and return true to indicate the end of a key sequence.
    evaluate(key) {
        // current.ruleSet is either the top-level rules or the child rules of the last-matched rule.
        for (let rule of this.current.ruleSet) {
            const result = rule.evaluate(key);
            if (result.match) {
                this.current.ruleSet = rule.childRules;
                this.current.keySequence.push(key);
                if ("context" in result) {
                    this.current.context = result.context;
                }

                if (rule.action) {
                    rule.action(this.current.context);
                }

                if (!rule.childRules.length) {
                    this.reset();
                    return true;
                }

                return false;
            }
        }

        this.reset();
        return false;
    }

    reset() {
        this.current.ruleSet = this.rules;
        this.current.keySequence = [];
        this.current.context = null;
    }
}

class Rule {
    /**
       A trigger is either:
         * A comma-separated list of named keyboard keys accepted by the rule, OR
         * A function which accepts the named pressed key and returns a value indicating acceptance or not
       If the latter, the function can return either:
         * true or false, to indicate "accepted" or "not accepted"
         * Any other value, indicating implicit acceptance along with a context value which is passed to
           subsequent rule triggers and rule actions.
       Action is optional and will be invoked on each matching rule in a sequence, not just terminal ones.
     * @param {string|((key: string) => boolean|any)} trigger
     * @param {Rule[]} childRules
     * @param {(context: any) => any} action
     */
    constructor(trigger, childRules, action) {
        this.trigger = typeof trigger === "string" ? namedKeyTrigger(trigger) : trigger;
        this.childRules = childRules;
        this.action = action;

        function namedKeyTrigger(targetKeys) {
            const keys = targetKeys.split(",").map(s => s.trim());
            // Simple trigger which just returns true or false, with no context
            return key => keys.includes(key);
        }
    }

    /** @returns {{ match: boolean, context?: any }} */
    evaluate(key, context) {
        const result = this.trigger(key, context);
        if (typeof result === "boolean") {
            return { match: result };
        } else {
            return { match: true, context: result };
        }
    }
}

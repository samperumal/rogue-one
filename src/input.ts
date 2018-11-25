export { InputStateMachine, Rule };

// A state machine to handle sequences of input keys
class InputStateMachine {
    private current: { ruleSet: Rule[], keySequence: string[], context: any };

    constructor(readonly rules: Rule[]) {
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
        for (const rule of this.current.ruleSet) {
            const {match, context} = rule.evaluate(key, this.current.context);
            if (!match) continue;

            // Replace the context if the trigger supplied any.
            if (typeof context !== "undefined") {
                this.current.context = context;
            }

            if (rule.action) {
                rule.action(this.current.context);
            }

            // If there are child rules, we aren't done with the current key sequence yet.
            // Set us up to evaluate the next keypress against the child rules.
            if (rule.childRules.length) {
                this.current.ruleSet = rule.childRules;
                this.current.keySequence.push(key);
                return false;
            } else {
                // No child rules means the end of a sequence, so reset and let caller know.
                this.reset();
                return true;
            }
        }

        // No rules matched means the pressed key doesn't continue the current sequence, so reset.
        this.reset();
        return false;
    }

    reset() {
        this.current = {
            ruleSet: this.rules,
            keySequence: [],
            context: null
        };
    }
}

type TriggerFunc = (key: string, context: any) => any;

class Rule {
    private readonly trigger: TriggerFunc;

    /*
       The trigger is either:
         * A comma-separated list of named keyboard keys accepted by the rule, OR
         * A function which accepts the named pressed key and returns a value indicating acceptance or not
       If the latter, the function can return either:
         * true or false, to indicate "accepted" or "not accepted"
         * undefined, to indicate "not accepted"
         * Any other value, indicating implicit acceptance along with a context value which is passed to
           subsequent rule triggers and rule actions.
       Action is optional and will be invoked on each matching rule in a sequence, not just terminal ones.
       Context returned by previous triggers is untouched if a trigger returns true; to explicitly blank
       context from a trigger function, return null.
     */
    constructor(trigger: string | TriggerFunc, readonly childRules: Rule[], readonly action: (context: any) => void) {
        this.trigger = typeof trigger === "string" ? namedKeyTrigger(trigger) : trigger;
        this.childRules = childRules;
        this.action = action;

        function namedKeyTrigger(targetKeys: string) {
            const keys = targetKeys.split(",").map(s => s.trim());
            // Simple trigger which just returns true or false, with no context
            return (key: string) => keys.includes(key);
        }
    }

    evaluate(key: string, context?: any) {
        const result = this.trigger(key, context);
        if (typeof result === "boolean") {
            return { match: result };
        } else if (typeof result === "undefined") {
            return { match: false };
        } else {
            return { match: true, context: result };
        }
    }
}

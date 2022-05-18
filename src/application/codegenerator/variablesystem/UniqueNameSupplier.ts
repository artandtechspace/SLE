export class UniqueNameSupplier{

    // Already used variable-names
    private usedNames : string[] = [];

     /**
     * Takes in a required name and returns it's unique value. Meaning that is for example "var" would be requested twice, the first time "var" would be returned and the second "var2".
     */
    public getUniqueNameFor(name: string) {
        // Next name to test
        var nameIteration = name;

        // Current next index for the name
        var indexIteration = 1;

        // Searches until a valid name got found.
        while (true) {
            // Checks if the name already exists
            if (this.usedNames.filter(nm => nm === nameIteration).length >= 1){
                // Advances the name
                nameIteration = name+(++indexIteration);
                continue;
            }

            // Registers the name
            this.usedNames.push(nameIteration);

            // Returns the name
            return nameIteration;
        }
    }
}
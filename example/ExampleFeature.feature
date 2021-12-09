Feature: Exampley File for Features

    Feature Description

    Rule: Supports the `Rule` keyword

        Example: One rule
            Given a feature file "file.feature"
                """
    Feature: Math

        Feature for math

    Rule: Addition is transitive

        Example: One plus one equals two
            Given one plus one
            Then it equals 2
                """
            Then picklesdoc runs without error
            And it outputs a JSON string
                """
                {
                    "Feature": "TODO"
                }
                """
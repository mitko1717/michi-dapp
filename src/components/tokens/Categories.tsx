import React, {useEffect} from "react";
import {Checkbox, CheckboxGroup, Chip} from "@nextui-org/react";
import {useChainId} from "wagmi";
import {getCategoriesFromChain} from "../../utils/categories";

interface CategoriesProps {
    setSelected: (value: string[]) => void;
    selected: string[];
}

const Categories = ({setSelected, selected}: CategoriesProps) => {
    const chainId = useChainId();

    useEffect(() => {
        setSelected(["all"]);
    }, [chainId]);

    const handleSelectionChange = (newSelection: string[]) => {
        if (selected.includes("all") && newSelection.length > 1) {
            setSelected(newSelection.filter(item => item !== "all"));
        } else if (newSelection.includes("all")) {
            setSelected(["all"]);
        } else {
            setSelected(newSelection);
        }
    };

    const handleSpanClick = (categoryName: string) => {
        let newSelection;
        if (categoryName === "all") {
            newSelection = ["all"];
        } else if (selected.includes(categoryName)) {
            newSelection = selected.filter(item => item !== categoryName);
            if (newSelection.length === 0) {
                newSelection = ["all"];
            }
        } else {
            newSelection = [...selected, categoryName];
            if (newSelection.includes("all")) {
                newSelection = newSelection.filter(item => item !== "all");
            }
        }
        setSelected(newSelection);
    };

    return (
        <div>
            <div>
                <Chip color={selected.includes("all") ? "primary" : "default"} onClick={() => handleSpanClick("all")}
                      className="cursor-pointer mr-1 mt-1">
                    All
                </Chip>
                {getCategoriesFromChain(chainId).map((category) => (
                    <Chip color={selected.includes(category.name) ? "primary" : "default"}
                          key={category.name}
                          onClick={() => handleSpanClick(category.name)}
                          className="cursor-pointer mr-1 mt-1"
                    >
                        {category.name}
                    </Chip>
                ))}
            </div>
            {/*<CheckboxGroup*/}
            {/*    label="Select a category"*/}
            {/*    orientation="horizontal"*/}
            {/*    color="secondary"*/}
            {/*    defaultValue={selected}*/}
            {/*    value={selected}*/}
            {/*    onValueChange={handleSelectionChange}*/}
            {/*>*/}
            {/*    <Checkbox key="all" value="all">All</Checkbox>*/}
            {/*    {*/}
            {/*        getCategoriesFromChain(chainId).map((category) => (*/}
            {/*            <Checkbox key={category.name} value={category.name}>{category.name}</Checkbox>*/}
            {/*        ))*/}
            {/*    }*/}
            {/*</CheckboxGroup>*/}
        </div>
    );
};

export default Categories;

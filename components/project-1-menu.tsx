import React from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
// Méretek

const ButtonWidth = "8rem";
const ButtonHeight = "2rem";
const ButtonColor = "#fff";

const FONT_UI = "-apple-system";


const MenuContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 50%;
    height: 50%;
    gap: 1rem;
`;

const MenuItem = styled.button`
    width: ${ButtonWidth};
    height: ${ButtonHeight};
    background-color: ${ButtonColor};
    border: 1px solid rgba(168, 85, 247, 0.2);
    border-radius: 10px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    &:hover {
        background-color: rgba(168, 85, 247, 0.1);
        transform: translateY(-2px);
    }
`;

const ButtonText = styled.h2`
    font-size: 0.8rem;
    font-family: ${FONT_UI};
    letter-spacing: 0.005rem;
    text-align: center;

`;

const MenuTitle = styled.h2`
    font-size: 1.5rem;
    font-family: ${FONT_UI};
    text-align: center;

`;
export default function Project1Menu() {
    const router = useRouter();

    return (
        <MenuContainer>
            <MenuTitle>Choose section</MenuTitle>
            <MenuItem onClick={() => router.push("/projects/project-1/medical")}>
                <ButtonText>Medical Department</ButtonText>
            </MenuItem>
            <MenuItem>
                <ButtonText>Button</ButtonText>
            </MenuItem>
            <MenuItem>
                <ButtonText>Button</ButtonText>
            </MenuItem>
        </MenuContainer>
    );
}
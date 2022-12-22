import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import classNames from "classnames";

import styles from "../styles/projects.module.css";
import TextInput from "../components/TextInput";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

type Filter = { key: string; display: string };

const filters: Filter[] = [
    { key: "css", display: "CSS" },
    { key: "javascript", display: "JavaScript" },
    { key: "three", display: "Three.js" }
];

type ProjectData = {
    relativePath: string;
    name: string;
    explanation: string;
    imageClass: string;
    hoverImageClass: string;
    tags: string[];
};

const projectDataList: ProjectData[] = [
    {
        relativePath: "cube",
        name: "3D Cube",
        explanation: "This is a 3D cube that rotates",
        imageClass: "bg-[url('../src/assets/rotating-cube.png')]",
        hoverImageClass: "group-hover:bg-[url('../src/assets/rotating-cube.gif')]",
        tags: ["css"]
    },
    {
        relativePath: "",
        name: "Second",
        explanation: "This is another project",
        imageClass: "",
        hoverImageClass: "",
        tags: ["javascript", "three"]
    },
    {
        relativePath: "",
        name: "Third",
        explanation: "Third project 'er",
        imageClass: "",
        hoverImageClass: "",
        tags: ["three"]
    },
    {
        relativePath: "",
        name: "Fourth",
        explanation: "Here's is the fourth project...",
        imageClass: "",
        hoverImageClass: "",
        tags: []
    },
    {
        relativePath: "broken",
        name: "Broken",
        explanation: "This is the fifth and final project my guy",
        imageClass: "",
        hoverImageClass: "",
        tags: ["css", "javascript", "three"]
    }
];

const fallbackBackgroundClass = "bg-[url('../src/assets/placeholder.png')]";
const fallbackBackgroundHoverClass = "hover:bg-[url('../src/assets/placeholder.png')]";

const CARD_ANIMATION_DELAY = 150;

export default function ProjectsPage() {
    const location = useLocation();

    const searchInputRef = useRef<HTMLInputElement>(null);

    const [searchValue, setSearchValue] = useState<string>("");
    const [currentFilter, setCurrentFilter] = useState<string | null>(null);
    const [results, setResults] = useState(projectDataList.map((project) => project.name));

    // watch the search/filters and update the results when they change
    useEffect(() => {
        const timeout = setTimeout(() => {
            const newResults = projectDataList
                .filter((projectData) => {
                    const lowerCaseName = projectData.name.toLowerCase();

                    const matchesSearchValue =
                        lowerCaseName.includes(searchValue.toLowerCase()) ||
                        projectData.tags.some((tag) => tag.toLowerCase().includes(searchValue.toLowerCase()));

                    const matchesFilter = currentFilter === null || projectData.tags.includes(currentFilter);

                    return matchesSearchValue && matchesFilter;
                })
                .map((projectData) => projectData.name);

            setResults(newResults);
        }, CARD_ANIMATION_DELAY);

        return () => {
            clearTimeout(timeout);
        };
    }, [searchValue, currentFilter]);

    // handle events on the page
    const onClickSearchIcon = () => {
        searchInputRef.current?.select();
    };

    const onChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        setSearchValue(event.target.value);
    };

    const onClickFilter = (filterKey: string) => {
        setCurrentFilter(currentFilter === filterKey ? null : filterKey);
    };

    // check if this is a specific project page, or if we're at the base project page
    const isChild = location.pathname !== "/projects" && location.pathname !== "/projects/";

    let movingCards = false;

    return isChild ? (
        <Outlet />
    ) : (
        <div className="flex flex-col items-center">
            <strong className="mb-8 font-bold text-yellow-600">Check out some of my projects below!</strong>

            {/* search/filter section */}
            <section className="mb-10 w-96">
                {/* search input */}
                <div className="mb-2 flex h-10 items-center rounded-sm bg-gray-800">
                    <MagnifyingGlassIcon
                        className="w-10 flex-none cursor-pointer p-2 text-gray-700 hover:text-gray-500"
                        onClick={onClickSearchIcon}
                    />
                    <hr className="h-3/5 w-px border-none bg-gray-700" />
                    <TextInput
                        name="search"
                        placeholder="Search"
                        className="rounded-l-none bg-transparent"
                        ref={searchInputRef}
                        autoComplete="off"
                        onChange={onChangeSearch}
                    />
                </div>

                {/* filter dropdown */}
                <div className="relative mx-auto flex justify-center gap-2">
                    {filters.map((filter, index) => {
                        return (
                            <span
                                key={index}
                                onClick={() => {
                                    onClickFilter(filter.key);
                                }}
                                className={classNames(
                                    "transparent cursor-pointer select-none rounded-full bg-gray-800 py-1 px-3 text-sm hover:bg-yellow-600",
                                    { "bg-yellow-700 hover:bg-yellow-700": filter.key === currentFilter }
                                )}
                            >
                                {filter.display}
                            </span>
                        );
                    })}
                </div>
            </section>

            {/* projects section */}
            <section className="flex w-[69rem] flex-wrap gap-12">
                {projectDataList.map((projectData, index) => {
                    const searchFiltered = !(
                        projectData.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                        projectData.tags.some((element) => element.toLowerCase().includes(searchValue.toLowerCase()))
                    );
                    const tagFiltered = !!currentFilter && !projectData.tags.includes(currentFilter);

                    const notRendered = !results.includes(projectData.name);

                    if (
                        (notRendered && !searchFiltered && !tagFiltered) ||
                        (!notRendered && (searchFiltered || tagFiltered))
                    ) {
                        movingCards = true;
                    }

                    return (
                        <ProjectCard
                            to={`/projects/${projectData.relativePath}`}
                            name={projectData.name}
                            explanation={projectData.explanation}
                            className={classNames(
                                styles.card,
                                "transition-all duration-150",
                                movingCards ? "scale-0" : "",
                                {
                                    hidden: notRendered
                                }
                            )}
                            imageClass={projectData.imageClass}
                            hoverImageClass={projectData.hoverImageClass}
                            key={index}
                        />
                    );
                })}
            </section>
        </div>
    );
}

type ProjectCardProps = {
    to: string;
    name: string;
    explanation: string;
    className: string | undefined;
    imageClass: string;
    hoverImageClass: string;
};

function ProjectCard({ to, name, explanation, className, imageClass, hoverImageClass }: ProjectCardProps) {
    const [left, setLeft] = useState(0);
    const [top, setTop] = useState(0);
    const cardRef = useRef<HTMLAnchorElement>(null);
    const hoverEffectRef = useRef<HTMLDivElement>(null);

    const onMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (!cardRef.current || !hoverEffectRef.current) return;

        let cardRefRect = cardRef.current.getBoundingClientRect();
        let hoverEffectRadius = hoverEffectRef.current.getBoundingClientRect().width / 2;

        setLeft(event.clientX - cardRefRect.left - hoverEffectRadius);
        setTop(event.clientY - cardRefRect.top - hoverEffectRadius);
    };

    return (
        <Link
            to={to}
            className={classNames("group relative overflow-hidden rounded-lg", className)}
            onMouseMove={onMouseMove}
            ref={cardRef}
        >
            {/* hover effect */}
            <div
                className={classNames(
                    "absolute z-10 aspect-square w-[125%] opacity-0 transition-opacity duration-300 group-hover:opacity-10",
                    styles.cardPointerEffect
                )}
                style={{ left, top }}
                ref={hoverEffectRef}
            />

            {/* faded background overlay */}
            <div className="absolute bottom-0 h-1/4 w-full rounded-b-lg bg-black transition-all duration-300 group-hover:h-0"></div>
            <div className="absolute top-0 h-3/4 w-full rounded-t-lg bg-gradient-to-t from-black to-transparent transition-all duration-300 group-hover:h-full group-hover:rounded-b-lg"></div>

            {/* card contents */}
            <article
                className={classNames(
                    "box-highlight flex h-60 w-60 flex-col rounded-lg bg-gray-300 bg-cover bg-center grayscale-[80%] transition-all duration-300 group-hover:grayscale-0",
                    !!imageClass ? imageClass : fallbackBackgroundClass,
                    !!hoverImageClass ? hoverImageClass : fallbackBackgroundHoverClass
                )}
                style={{ transitionProperty: "background" }}
            >
                <h2
                    className="text-shadow-lg relative py-4 text-center text-3xl font-bold text-gray-300"
                    style={{ textShadow: "0 0 1rem black" }}
                >
                    {name}
                </h2>
                <div className="relative flex h-1/2 flex-grow flex-col-reverse rounded-b-lg bg-gradient-to-t from-black to-transparent p-4">
                    <span className="text-right text-gray-300">{explanation}</span>
                </div>
            </article>
        </Link>
    );
}

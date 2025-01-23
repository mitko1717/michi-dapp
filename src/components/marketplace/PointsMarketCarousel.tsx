import React, {useRef, useState} from "react";
import {Button} from "@nextui-org/react";
import Slider, {LazyLoadTypes} from "react-slick";
import {FaArrowLeftLong, FaArrowRightLong} from "react-icons/fa6";

const lazyLoad: LazyLoadTypes = "ondemand";


const mock = [
    {
        name: "Renzo",
        icon: "/assets/platforms/icons/renzo.svg",
    },
    {
        name: "Kelp Miles",
        icon: "/assets/platforms/icons/kelp.svg",
    },
    {
        name: "Ethena Shards",
        icon: "/assets/platforms/icons/ethena.svg",
    },
    {
        name: "Puffer Points",
        icon: "/assets/platforms/icons/puffer.svg",
    },
    {
        name: "Etherfi",
        icon: "/assets/platforms/icons/etherfi.svg",
    },
    {
        name: "Eigenlayer",
        icon: "/assets/platforms/icons/eigenlayer.svg",
    }
];

interface PointsMarketCarouselProps {
    setSelectedPoint: React.Dispatch<React.SetStateAction<string>>;
}


const PointsMarketCarousel: React.FC<PointsMarketCarouselProps> = ({ setSelectedPoint }) => {
    const sliderRef = useRef<Slider>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slideCount, setSlideCount] = useState(0);

    const settings = {
        dots: true, // Show dots below the carousel
        infinite: true, // Loop the carousel
        speed: 500, // Transition speed
        slidesToShow: 4, // Number of slides to show at once
        slidesToScroll: 1, // Number of slides to scroll at once
        autoplay: true, // Enable autoplay
        autoplaySpeed: 3000, // Autoplay speed in milliseconds
        pauseOnHover: true,
        arrows: false,
        afterChange: (current: React.SetStateAction<number>) => setCurrentSlide(current),
        lazyLoad,
        responsive: [
            {
                breakpoint: 1500,  // xs breakpoint
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 1280,  // xs breakpoint
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 960,  // md breakpoint
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 650,  // xs breakpoint
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            }
        ]
    };

    return (
        <div className="my-20 ml-6">
            <div className="mb-4 flex flex-row flex-wrap justify-between items-center">
                <h2 className="text-2xl">Points Market</h2>
                <div className="flex items-center mr-6">
                    <Button isIconOnly
                            className="w-10 rounded-none rounded-l-lg bg-[rgba(72,55,67,0.40)] mr-1 text-light-text text-opacity-30"
                            size="sm" onClick={() => sliderRef?.current?.slickPrev()}
                            disabled={currentSlide === 0}><FaArrowLeftLong/></Button>
                    <Button isIconOnly
                            className="w-10 rounded-none rounded-r-lg bg-[rgba(72,55,67,0.40)] ml-1 text-light-text text-opacity-30"
                            size="sm" onClick={() => sliderRef?.current?.slickNext()}
                            disabled={currentSlide === slideCount - settings.slidesToShow}><FaArrowRightLong/></Button>
                </div>
            </div>
            <div>
                <Slider ref={sliderRef} {...settings}>
                    {mock.map((item) => (
                        <TokenizedPointsCard key={item.name} platform={item} setSelectedPoint={setSelectedPoint}/>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

function adjustPointNames(inputString: string): string {
    const pointNamesMap: { [key: string]: string } = {
        "Kelp Miles": "KelpDAO",
        "Ethena Shards": "Ethena",
        "Puffer Points": "Puffer"
    };

    return pointNamesMap[inputString] || inputString;
}

interface Platform {
    name: string;
    icon: string;
}

interface TokenizedPointsCardProps {
    platform: Platform;
    setSelectedPoint: (pointName: string) => void;
}

const TokenizedPointsCard: React.FC<TokenizedPointsCardProps> = ({platform, setSelectedPoint}) => {
    return (
        <div className="pichi-card mr-6 cursor-pointer" onClick={() => setSelectedPoint(adjustPointNames(platform?.name))}>
            <div className="px-3 py-5 flex flex-row items-center">
                <div>
                    <img src={platform.icon} alt="Platform Icon"
                         className="w-10 rounded-full mr-2"/>
                </div>
                <div>
                    <span className="text-lg">{platform?.name}</span>
                    {/*<div className="flex items-center">*/}
                    {/*    <span className="mr-2 text-subtitle text-tiny">Total Available for Sale: 10000</span>*/}
                    {/*</div>*/}
                </div>
            </div>
        </div>
    );
};

export default PointsMarketCarousel;

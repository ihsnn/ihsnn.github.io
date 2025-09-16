import { TypeAnimation } from "react-type-animation";

export default function TextMessage(props:any) {
    return(
        <div className="">
            <TypeAnimation
                sequence={[
                    // Same substring at the start will only be typed out once, initially
                    props?.text,
                    1000, // wait 1s before replacing "Mice" with "Hamsters"
                ]}
                wrapper="span"
                speed={50}
                style={{ fontSize: '25pt', display: 'inline-block', lineHeight:'22pt' }}
                repeat={Infinity}
            />
        </div>
    )
}
import { useState, useEffect } from 'react';
import Style from "./NFTDescription.module.css";

const Countdowntimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const endTimeMs = new Date(endTime).getTime();
      const difference = endTimeMs - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className={Style.NFTDescription_box_profile_biding_box_timer}>
      <div className={Style.NFTDescription_box_profile_biding_box_timer_item}>
        <p className="text-2xl font-bold">{timeLeft.days}</p>
        <span className="text-sm">Days</span>
      </div>
      <div className={Style.NFTDescription_box_profile_biding_box_timer_item}>
        <p className="text-2xl font-bold">{timeLeft.hours}</p>
        <span className="text-sm">Hours</span>
      </div>
      <div className={Style.NFTDescription_box_profile_biding_box_timer_item}>
        <p className="text-2xl font-bold">{timeLeft.minutes}</p>
        <span className="text-sm">Minutes</span>
      </div>
      <div className={Style.NFTDescription_box_profile_biding_box_timer_item}>
        <p className="text-2xl font-bold">{timeLeft.seconds}</p>
        <span className="text-sm">Seconds</span>
      </div>
    </div>
  );
};

export default Countdowntimer;
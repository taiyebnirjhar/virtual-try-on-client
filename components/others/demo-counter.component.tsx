import { useAppSelector } from "@/hooks/store.hook";
import { decrement, increment } from "@/redux/slices/counter.slice";
import { useDispatch } from "react-redux";
import { Button } from "../ui/button";

export default function DemoCounter() {
  const { counter } = useAppSelector((state) => state.counter);
  const dispatch = useDispatch();
  return (
    <div className=" flex justify-center items-center gap-3  text-gray-50">
      <Button onClick={() => dispatch(increment())}>Increment me</Button>
      <p>Counter: {counter}</p>

      <Button onClick={() => dispatch(decrement())}>Decrement me</Button>
    </div>
  );
}

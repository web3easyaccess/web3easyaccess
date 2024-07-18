// app/page.tsx
import { Button } from "@nextui-org/button";

// Important 🚨: Note that you need to import the component from the individual package, not from @nextui-org/react

export default function Page() {
  return (
    <div>
      <Button color="primary">Click me</Button>
    </div>
  );
}

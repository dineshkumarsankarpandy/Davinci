import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const SubscriptionPlan = () => {
  return (
    <Card className="bg-black text-white border-gray-800 mx-2 my-1">
      <CardHeader className="pb-1">
        <div className="flex justify-between items-center">
          <Badge
            variant="outline"
            className="bg-gray-800 text-gray-100 border-gray-700 text-xs"
          >
            CURRENT PLAN
          </Badge>
          <span className="font-bold text-white">${0}/month</span>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <CardTitle className="text-2xl font-bold mb-0">No plan active</CardTitle>
        <CardDescription className="text-gray-300">
          Beta version. No credit card required.
        </CardDescription>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full bg-transparent border-gray-700 text-white hover:bg-gray-800 hover:text-white cursor-not-allowed"
        >
          See pricing plans
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionPlan;

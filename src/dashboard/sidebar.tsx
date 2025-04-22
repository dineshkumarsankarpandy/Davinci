import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, ChevronLeft, ChevronRight, Home, LayoutDashboard, Star } from 'lucide-react';
import { ModeToggle } from './mode-toggle';
import SubscriptionPlan from './subscriptionCard';

interface SidebarProps {
  className?: string;
}

interface SidebarNavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    label?: string;
    icon: React.ReactNode;
    variant: 'default' | 'ghost';
    to: string;
  }[];
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle window resize for responsiveness
  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMounted) {
    return null;
  }

  const links: SidebarNavProps['links'] = [
    {
      title: 'Home',
      to: '/',
      icon: <Home className="h-5 w-5" />, 
      variant: 'default',
    },
    {
      title: 'Dashboard',
      to: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />, 
      variant: 'ghost',
    },
    {
      title: 'Review',
      to: '/review-design',
      icon: <Star className="h-5 w-5" />, 
      variant: 'ghost',
    },
  ];

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="h-full flex flex-col border-r">
            <div className="h-16 flex items-center justify-between px-4 border-b">
              <div className="flex items-center gap-x-2">
                <LayoutDashboard className="h-6 w-6" />
                <span className="font-bold text-lg">Dashboard</span>
              </div>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </div>
            <ScrollArea className="flex-1">
              <SidebarNav isCollapsed={false} links={links} />
            </ScrollArea>

            {/* Subscription card for mobile */}
            <div className="px-3">
              <SubscriptionPlan />
            </div>

            <div className="h-14 flex items-center justify-between px-3 border-t">
              <span className={cn("font-medium", !isCollapsed && "ml-3")}>
                <ModeToggle />
              </span>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex h-screen flex-col border-r",
          isCollapsed ? "w-16" : "w-72",
          className
        )}
      >
        <div className={cn("h-16 flex items-center border-b px-4", 
          isCollapsed && "justify-center px-2")}>
          {!isCollapsed ? (
            <div className="flex items-center gap-x-2">
              <LayoutDashboard className="h-6 w-6" />
              <span className="font-bold text-lg">Dashboard</span>
            </div>
          ) : (
            <LayoutDashboard className="h-6 w-6" />
          )}
        </div>

        <div className="flex-1">
          <SidebarNav isCollapsed={isCollapsed} links={links} />
        </div>

        {/* Subscription card */}
        {!isCollapsed && (
          <div className="px-3 py-2">
            <SubscriptionPlan />
          </div>
        )}
          
        {/* Bottom section with toggle */}
        <div className="h-14 flex items-center border-t px-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isCollapsed ? "Expand" : "Collapse"}
            </span>
          </Button>
          <span className={cn("font-medium", !isCollapsed && "ml-3")}>
            <ModeToggle />
          </span>
        </div>
      </div>
    </>
  );
}

function SidebarNav({ links, isCollapsed }: SidebarNavProps) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div
      className={cn(
        "flex flex-col gap-y-2 p-2",
        isCollapsed && "items-center"
      )}
    >
      {links.map((link, index) => (
        <Link
          key={index}
          to={link.to}
          className={cn(
            "flex items-center gap-x-2 text-slate-500 dark:text-slate-400 font-medium",
            link.to === pathname && "text-slate-900 dark:text-slate-50",
            isCollapsed ? "justify-center h-10 w-10" : "h-10 px-3 py-2",
            link.variant === "default" ? 
              "bg-slate-200/50 dark:bg-slate-800/50" : 
              "hover:bg-slate-200/50 dark:hover:bg-slate-800/50",
            "rounded-md transition-all"
          )}
        >
          {link.icon}
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full">
              <span>{link.title}</span>
              {link.label && (
                <span className="ml-auto bg-slate-900 text-slate-50 dark:bg-slate-800 dark:text-slate-50 text-xs rounded-md px-1.5 py-0.5">
                  {link.label}
                </span>
              )}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}

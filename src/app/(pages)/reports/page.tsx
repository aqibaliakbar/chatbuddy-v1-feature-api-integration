"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CalendarIcon,
  Globe,
  Gem,
  ArrowUpRight,
  ArrowDownRight,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MessagesSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingScreen from "@/components/loading-screen";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import Image from "next/image";
import mouseClick from "../../../../public/mouse-pointer.svg";

import { Alert, AlertDescription } from "@/components/ui/alert";
import useReportStore from "@/store/useReportStore";
import useChatbotStore from "@/store/useChatbotStore";
import ReportsEmptyState from "./components/empty-reports-state";

export default function ReportsPage() {
  const {
    filteredData: data,
    isLoading,
    error,
    fetchReport,
    setDateRange,
    dateRange,
  } = useReportStore();
  
const { selectedChatbotId } = useChatbotStore();

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: dateRange.from || undefined,
    to: dateRange.to || undefined,
  });

React.useEffect(() => {
  if (!selectedChatbotId) return;

  fetchReport(selectedChatbotId).catch((err) => {
    console.error("Error fetching report:", err);
  });
}, [selectedChatbotId, fetchReport]);

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (newDate?.from && newDate?.to) {
      setDateRange(newDate.from, newDate.to);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

 const isAllZeros = (data: any) => {
   if (!data) return true;

   return (
     data.conversations.value === 0 &&
     data.messages.value === 0 &&
     data.positiveFeedback.value === 0 &&
     data.negativeFeedback.value === 0 &&
     Object.keys(data.countryCounts).length === 0 &&
     (!data.messageLinkClicks.links ||
       data.messageLinkClicks.links.length === 0)
   );
 };

 // Then update the condition that checks for empty state
 if (error || !data || Object.keys(data).length === 0 || isAllZeros(data)) {
   return <ReportsEmptyState />;
 }

  // Transform API data for the UI
  const transformedData = {
    messageCredits: {
      used: data.messages.value,
      total: 5200,
    },
    chatbots: {
      used: data.conversations.value,
      total: 100,
    },
    visitors: Object.entries(data.countryCounts).map(([country, count]) => ({
      country,
      count,
      code: country.substring(0, 2).toUpperCase(),
    })),
    stats: {
      conversations: {
        count: data.conversations.value,
        change: data.conversations.percentChange,
      },
      messagesPerConv: {
        count: Math.round(
          data.messages.value / (data.conversations.value || 1)
        ),
        change: data.messages.percentChange,
      },
      positiveFeedback: {
        count: data.positiveFeedback.value,
        change: data.positiveFeedback.percentChange,
      },
      negativeFeedback: {
        count: data.negativeFeedback.value,
        change: data.negativeFeedback.percentChange,
      },
    },
    linkClicks: data.messageLinkClicks.links,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Reports</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-auto justify-start text-left font-normal gap-2",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Top Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Message Credits Card */}
        <Card className="p-6 lg:space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-primary">Message credits</p>
              <h3 className="text-2xl font-bold lg:mt-6">
                {transformedData.messageCredits.used}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                left from {transformedData.messageCredits.total} credits
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 font-medium text-sm"
            >
              <Gem className="h-4 w-4" />
              Upgrade
            </Button>
          </div>
          <Progress
            value={
              (transformedData.messageCredits.used /
                transformedData.messageCredits.total) *
              100
            }
            className="rounded-sm mt-4 lg:h-[22px]"
          />
        </Card>

        {/* Chatbots Card */}
        <Card className="p-6 lg:space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-primary">Conversations</p>
              <h3 className="text-2xl font-bold lg:mt-6">
                {transformedData.chatbots.used}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Total conversations
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 font-medium text-sm"
            >
              <Gem className="h-4 w-4" />
              Upgrade
            </Button>
          </div>
          <Progress
            value={
              (transformedData.chatbots.used / transformedData.chatbots.total) *
              100
            }
            className="rounded-sm mt-4 lg:h-[22px]"
          />
        </Card>

        {/* Visitors Card */}
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <p className="text-sm text-primary">Visitors from</p>
            <Globe className="h-4 w-4 text-primary font-medium" />
          </div>
          <div className="mt-4 space-y-4">
            {transformedData.visitors.map((visitor) => (
              <div
                key={visitor.country}
                className="flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={`https://flagcdn.com/24x18/${visitor.code.toLowerCase()}.png`}
                    alt={`${visitor.country} flag`}
                    width={20}
                    height={14}
                    className="inline-block"
                  />
                  <span className="font-medium">
                    {visitor.count.toLocaleString()}
                  </span>
                  <span className="text-sm">
                    Active visitors in {visitor.country}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="flex lg:flex-row flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2 lg:w-[67%]">
          {/* Conversations */}
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Conversations</p>
                <h3 className="text-2xl font-bold mt-2 lg:mt-6">
                  {transformedData.stats.conversations.count}
                </h3>
                <p
                  className={cn(
                    "text-sm mt-1 lg:mt-8 flex items-center gap-1",
                    transformedData.stats.conversations.change > 0
                      ? "text-[#18A957]"
                      : "dark:text-red-600 text-[#171717]"
                  )}
                >
                  {transformedData.stats.conversations.change > 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {Math.abs(transformedData.stats.conversations.change)}%
                  <span className="text-muted-foreground"> vs last Month</span>
                </p>
              </div>
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
          </Card>

          {/* Messages per Conversation */}
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-primary">Messages / Conv</p>
                <h3 className="text-2xl font-bold mt-2 lg:mt-6">
                  {transformedData.stats.messagesPerConv.count}
                </h3>
                <p
                  className={cn(
                    "text-sm mt-1 lg:mt-8 flex items-center gap-1",
                    transformedData.stats.messagesPerConv.change > 0
                      ? "text-[#18A957]"
                      : "dark:text-red-600 text-[#171717]"
                  )}
                >
                  {transformedData.stats.messagesPerConv.change > 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {Math.abs(transformedData.stats.messagesPerConv.change)}%
                  <span className="text-muted-foreground">vs last Month</span>
                </p>
              </div>
              <MessagesSquare className="h-4 w-4 text-primary" />
            </div>
          </Card>

          {/* Positive Feedback */}
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-primary">Positive Feedback</p>
                <h3 className="text-2xl font-bold mt-2 lg:mt-6">
                  {transformedData.stats.positiveFeedback.count}
                </h3>
                <p
                  className={cn(
                    "text-sm mt-1 lg:mt-8 flex items-center gap-1",
                    transformedData.stats.positiveFeedback.change > 0
                      ? "text-[#18A957]"
                      : "dark:text-red-600 text-[#171717]"
                  )}
                >
                  {transformedData.stats.positiveFeedback.change > 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {Math.abs(transformedData.stats.positiveFeedback.change)}%
                  <span className="text-muted-foreground">vs last Month</span>
                </p>
              </div>
              <ThumbsUp className="h-4 w-4 text-primary" />
            </div>
          </Card>

          {/* Negative Feedback */}
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-primary">Negative Feedback</p>
                <h3 className="text-2xl font-bold mt-2 lg:mt-6">
                  {transformedData.stats.negativeFeedback.count}
                </h3>
                <p
                  className={cn(
                    "text-sm mt-1 lg:mt-8 flex items-center gap-1",
                    transformedData.stats.negativeFeedback.change > 0
                      ? "text-[#18A957]"
                      : "dark:text-red-600 text-[#171717]"
                  )}
                >
                  {transformedData.stats.negativeFeedback.change > 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {Math.abs(transformedData.stats.negativeFeedback.change)}%
                  <span className="text-muted-foreground">vs last Month</span>
                </p>
              </div>
              <ThumbsDown className="h-4 w-4 text-primary" />
            </div>
          </Card>
        </div>

        {/* Message Link Clicks */}
        <Card className="p-6 lg:w-auto lg:min-w-[32.5%]">
          <div className="flex justify-between items-start mb-6">
            <p className="text-sm text-primary">Message Link Clicks</p>
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
              <Image
                src={mouseClick}
                alt="mouse-click"
                width={32}
                height={32}
                className="rounded-lg dark:invert"
              />
            </Button>
          </div>
          <div className="space-y-4">
            {transformedData.linkClicks.map((link) => (
              <div key={link.url} className="flex gap-3 items-center">
                <span className="font-medium">{link.clicks}</span>
                <span className="text-sm text-muted-foreground text-wrap">
                  {link.url}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
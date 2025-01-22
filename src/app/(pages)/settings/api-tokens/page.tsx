"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Copy, Check } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import useApiTokenStore from "@/store/useApiTokenStore";


export default function ApiTokenSettings() {
  const { toast } = useToast();
  const { tokens, createToken, getTokens, deleteToken, isLoading } =
    useApiTokenStore();
  const [newTokenName, setNewTokenName] = useState("");
  const [copiedTokenId, setCopiedTokenId] = useState<number | null>(null);

  useEffect(() => {
    getTokens().catch((error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load API tokens.",
      });
    });
  }, [getTokens, toast]);

  const handleCreateToken = async () => {
    if (!newTokenName.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a token name.",
      });
      return;
    }

    try {
      await createToken(newTokenName.trim());
      setNewTokenName("");
      toast({
        title: "Token Created",
        description: "Your new API token has been created successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create API token.",
      });
    }
  };

  const handleDeleteToken = async (id: number) => {
    try {
      await deleteToken(id);
      toast({
        title: "Token Deleted",
        description: "The API token has been deleted successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete API token.",
      });
    }
  };

  const handleCopyToken = async (token: string, id: number) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedTokenId(id);
      setTimeout(() => setCopiedTokenId(null), 2000);
      toast({
        title: "Token Copied",
        description: "API token has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy token to clipboard.",
      });
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="pb-4">
        <h1 className="text-xl font-semibold mb-1">Create API Token</h1>
        <p className="text-sm text-muted-foreground">
          You can generate a personal access token for each application you use
          that needs access to the API.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="space-y-4 pt-4 rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="tokenName">API Token Name</Label>
          <Input
            id="tokenName"
            value={newTokenName}
            onChange={(e) => setNewTokenName(e.target.value)}
            className="max-w-xl bg-background"
            placeholder="Enter token name"
          />
        </div>
        <Button
          onClick={handleCreateToken}
          disabled={!newTokenName || isLoading}
          className="bg-primary hover:bg-primary/90 disabled:bg-primary/70"
        >
          Create API Token
        </Button>
      </div>
      <div className="space-y-4 mt-16">
        <h2 className="text-lg font-medium">Your API Tokens</h2>

        {tokens.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-3 border rounded-lg">
            <div className="text-sm text-muted-foreground bg-cmuted p-4 rounded-md">
              No tokens
            </div>
            <p className="text-sm text-muted-foreground">
              You haven&apos;t created any API tokens yet. Create one to get started.
            </p>
          </div>
        ) : (
          <Table className="border rounded-lg overflow-hidden border-border bg-cmuted">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Token</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token) => (
                <TableRow key={token.id} className="text-sm">
                  <TableCell>{token.name}</TableCell>
                  <TableCell className="font-mono">{token.token}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyToken(token.token, token.id)}
                        className="h-8 px-2"
                      >
                        {copiedTokenId === token.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDeleteToken(token.id)}
                        className="h-8"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

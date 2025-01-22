"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, MoreHorizontal, Pencil, Trash2, X, Upload } from "lucide-react";

interface Product {
  id: string;
  name: string;
  image: string;
  status: "Trained" | "Draft";
  description: string;
  price: string;
  url: string;
}

export default function AddProductsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    image: "",
    description: "",
    price: "",
    url: "",
  });
  const [previewImage, setPreviewImage] = useState<string>("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
        setNewProduct({ ...newProduct, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.image) return;

    const product: Product = {
      id: Date.now().toString(),
      ...newProduct,
      status: "Draft",
    };
    setProducts([...products, product]);
    setNewProduct({
      name: "",
      image: "",
      description: "",
      price: "",
      url: "",
    });
    setPreviewImage("");
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  return (
    <div className="p-6 xl:mr-96">
      <div className="flex items-center space-x-2 mb-6">
        <h1 className="text-xl font-semibold">Add New Sources</h1>
        <Badge
          variant="secondary"
          className="rounded-md bg-zinc-100 hover:bg-zinc-100 text-zinc-900"
        >
          Add Products
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-base font-medium">Create Custom Products</h2>
          <p className="text-sm text-muted-foreground">
            Easily create and display your custom products directly in the
            chatbot.
          </p>
        </div>

        <div className="space-y-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <span className="font-medium">{product.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      product.status === "Trained"
                        ? "bg-green-500"
                        : "bg-zinc-300"
                    }`}
                  />
                  <span className={`text-sm`}>{product.status}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2">
                      <Pencil className="h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 text-red-600"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={() => setIsDialogOpen(true)}
          variant="outline"
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Create
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Create Custom Products</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Product Image</Label>
              <div
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-zinc-50"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Product preview"
                    className="w-32 h-32 rounded object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <Upload className="h-8 w-8 text-zinc-400" />
                    <span className="text-sm text-zinc-500">
                      Click to upload image
                    </span>
                  </div>
                )}
                <Input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Displayed in the launcher button, 400 × 400px recommended.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Product Description</Label>
              <Textarea
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                placeholder="This is a product available in our catalog."
              />
              <p className="text-xs text-muted-foreground">
                Write a detailed product description with relevant keywords. The
                more information you provide, the better the chatbot will
                understand the product to help sell it effectively.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                type="number"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label>Product Link URL</Label>
              <Input
                value={newProduct.url}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, url: e.target.value })
                }
                type="url"
              />
            </div>

            <Button
              onClick={handleAddProduct}
              className="w-full bg-zinc-900 text-white hover:bg-zinc-800"
            >
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

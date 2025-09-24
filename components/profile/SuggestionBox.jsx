import React, { useState } from "react";
import { Suggestion } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SuggestionBox() {
  const [suggestion, setSuggestion] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!suggestion || !category) return;

    setIsSubmitting(true);
    try {
      await Suggestion.create({
        suggestion_text: suggestion,
        category: category,
      });
      setIsSubmitted(true);
      setSuggestion("");
      setCategory("");
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error("Error submitting suggestion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-emerald-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900">Have an Idea?</span>
            <p className="text-sm text-gray-600 font-normal">
              Submit your suggestions to improve EcoHustle.
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6 bg-green-50 rounded-xl"
          >
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900">Thank You!</h3>
            <p className="text-green-800">Your suggestion has been received.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UI/UX Improvement">UI/UX Improvement</SelectItem>
                  <SelectItem value="New Feature">New Feature Idea</SelectItem>
                  <SelectItem value="Functionality">Functionality Tweak</SelectItem>
                  <SelectItem value="Bug Report">Bug Report</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Suggestion</label>
              <Textarea
                placeholder="Describe your idea in detail..."
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                rows={4}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || !suggestion || !category}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Idea"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
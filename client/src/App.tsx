
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Eye, FileText, BarChart3 } from 'lucide-react';
import { trpc } from '@/utils/trpc';
// Using type-only imports for better TypeScript compliance
import type { Presentation, PresentationWithSlides } from '../../server/src/schema';

// Demo data since handlers are stubs - moved outside component to avoid dependency issues
const demoData: PresentationWithSlides[] = [
  {
    id: 1,
    title: "LLM Applications in Text Analytics 📊",
    description: "Comprehensive guide to leveraging Large Language Models for advanced text analysis",
    view_count: 142,
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-20'),
    slides: [
      {
        id: 1,
        title: "Introduction to LLM Text Analytics 🚀",
        content: "Large Language Models have revolutionized text analytics by providing unprecedented capabilities in understanding, processing, and generating human-like text. This presentation explores practical applications and implementation strategies.",
        image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
        order_index: 0,
        created_at: new Date('2024-01-15')
      },
      {
        id: 2,
        title: "Sentiment Analysis with LLMs 💭",
        content: "Traditional sentiment analysis relied on rule-based approaches and simple ML models. LLMs bring contextual understanding, handling nuanced expressions, sarcasm, and complex emotional states with remarkable accuracy.",
        image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
        order_index: 1,
        created_at: new Date('2024-01-15')
      },
      {
        id: 3,
        title: "Entity Recognition & Extraction 🔍",
        content: "LLMs excel at identifying and extracting entities from unstructured text - names, organizations, locations, dates, and custom domain-specific entities. This enables powerful information extraction pipelines for business intelligence.",
        image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
        order_index: 2,
        created_at: new Date('2024-01-15')
      },
      {
        id: 4,
        title: "Text Summarization & Insights ⚡",
        content: "Automated summarization capabilities of LLMs can process vast amounts of text and extract key insights, themes, and actionable intelligence. Perfect for document analysis, research synthesis, and content curation.",
        image_url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=400&fit=crop",
        order_index: 3,
        created_at: new Date('2024-01-15')
      },
      {
        id: 5,
        title: "Implementation Best Practices ⚙️",
        content: "Successful LLM integration requires careful consideration of prompt engineering, model selection, cost optimization, and ethical guidelines. Establish clear evaluation metrics and maintain human oversight for critical applications.",
        image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
        order_index: 4,
        created_at: new Date('2024-01-15')
      }
    ]
  },
  {
    id: 2,
    title: "Advanced NLP Techniques 🔬",
    description: "Deep dive into sophisticated natural language processing methodologies",
    view_count: 89,
    created_at: new Date('2024-01-10'),
    updated_at: new Date('2024-01-18'),
    slides: [
      {
        id: 6,
        title: "Neural Language Models Evolution 🧠",
        content: "From RNNs to Transformers, the evolution of neural language models has been remarkable. Understanding this progression helps in selecting the right approach for specific text analytics tasks.",
        image_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=400&fit=crop",
        order_index: 0,
        created_at: new Date('2024-01-10')
      },
      {
        id: 7,
        title: "Fine-tuning Strategies 🎯",
        content: "Domain-specific fine-tuning can significantly improve model performance on specialized tasks. Learn about transfer learning, few-shot learning, and parameter-efficient fine-tuning techniques.",
        image_url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop",
        order_index: 1,
        created_at: new Date('2024-01-10')
      }
    ]
  }
];

function App() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [selectedPresentation, setSelectedPresentation] = useState<PresentationWithSlides | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load presentations - using demo data since API handlers are stubs
  const loadPresentations = useCallback(async () => {
    try {
      // STUB NOTICE: Using demo data because get_presentations handler is not implemented
      const result = await trpc.getPresentations.query();
      if (result.length === 0) {
        // Use demo data when API returns empty (which it does since it's a stub)
        setPresentations(demoData.map((presentation) => ({
          id: presentation.id,
          title: presentation.title,
          description: presentation.description,
          view_count: presentation.view_count,
          created_at: presentation.created_at,
          updated_at: presentation.updated_at
        })));
      } else {
        setPresentations(result);
      }
    } catch (error) {
      console.error('Failed to load presentations:', error);
      // Fallback to demo data on error
      setPresentations(demoData.map((presentation) => ({
        id: presentation.id,
        title: presentation.title,
        description: presentation.description,
        view_count: presentation.view_count,
        created_at: presentation.created_at,
        updated_at: presentation.updated_at
      })));
    }
  }, []); // No dependencies needed since demoData is outside component

  useEffect(() => {
    loadPresentations();
  }, [loadPresentations]);

  const loadPresentation = async (presentationId: number) => {
    setIsLoading(true);
    try {
      // STUB NOTICE: Using demo data because get_presentation_with_slides handler is not implemented
      const result = await trpc.getPresentationWithSlides.query({ id: presentationId });
      if (result === null) {
        // Use demo data when API returns null (which it does since it's a stub)
        const demoPresentation = demoData.find(p => p.id === presentationId) || demoData[0];
        setSelectedPresentation(demoPresentation);
        // Increment view count
        await trpc.incrementViewCount.mutate({ id: presentationId });
      } else {
        setSelectedPresentation(result);
        await trpc.incrementViewCount.mutate({ id: presentationId });
      }
      setCurrentSlideIndex(0);
    } catch (error) {
      console.error('Failed to load presentation:', error);
      // Fallback to demo data on error
      const demoPresentation = demoData.find(p => p.id === presentationId) || demoData[0];
      setSelectedPresentation(demoPresentation);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    if (selectedPresentation && currentSlideIndex < selectedPresentation.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
  };

  const backToList = () => {
    setSelectedPresentation(null);
    setCurrentSlideIndex(0);
  };

  if (selectedPresentation) {
    const currentSlide = selectedPresentation.slides[currentSlideIndex];
    const totalSlides = selectedPresentation.slides.length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={backToList}
              className="flex items-center gap-2 hover:bg-white/50"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Presentations
            </Button>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {selectedPresentation.view_count} views
              </Badge>
              <div className="text-sm text-gray-600">
                Slide {currentSlideIndex + 1} of {totalSlides}
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedPresentation.title}
              </h1>
              {selectedPresentation.description && (
                <p className="text-gray-600 text-lg">
                  {selectedPresentation.description}
                </p>
              )}
            </div>

            {/* Main slide display */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-center text-gray-800">
                  {currentSlide.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentSlide.image_url && (
                  <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={currentSlide.image_url}
                      alt={currentSlide.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {currentSlide.content}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {selectedPresentation.slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlideIndex
                        ? 'bg-indigo-600'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                onClick={nextSlide}
                disabled={currentSlideIndex === totalSlides - 1}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Slide thumbnails */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {selectedPresentation.slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    index === currentSlideIndex
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:bg-white/70'
                  }`}
                >
                  <div className="text-xs font-medium text-gray-800 mb-1 truncate">
                    {slide.title}
                  </div>
                  <div className="text-xs text-gray-600 line-clamp-2">
                    Slide {index + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              LLM Text Analytics Hub
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore comprehensive presentations on Large Language Model applications 
            in text analytics and natural language processing
          </p>
        </div>

        {/* Demo notice */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-600 text-sm">ℹ️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">Demo Mode</h3>
                  <p className="text-amber-700 text-sm">
                    This application is using demo data since the backend handlers are not yet implemented. 
                    The presentations and slides shown are examples of how the system would work with real data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Presentations grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presentations.map((presentation: Presentation) => (
              <Card 
                key={presentation.id}
                className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => loadPresentation(presentation.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl text-gray-800 line-clamp-2 pr-2">
                      {presentation.title}
                    </CardTitle>
                    <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {presentation.description && (
                    <p className="text-gray-600 line-clamp-3">
                      {presentation.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {presentation.view_count} views
                    </Badge>
                    <span className="text-gray-500">
                      {presentation.created_at.toLocaleDateString()}
                    </span>
                  </div>
                  
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'View Presentation'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {presentations.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No presentations available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

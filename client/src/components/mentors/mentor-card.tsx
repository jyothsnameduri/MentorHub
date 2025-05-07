import { User } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Star } from "lucide-react";
import BookingModal from "./booking-modal";

interface MentorCardProps {
  mentor: User;
}

export default function MentorCard({ mentor }: MentorCardProps) {
  const [showModal, setShowModal] = useState(false);
  
  const handleConnectClick = () => {
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
  };
  
  // Generate random rating for demo purposes - in a real app, this would come from your backend
  const rating = (Math.floor(Math.random() * 15) + 35) / 10; // Random rating between 3.5 and 5.0
  const reviewCount = Math.floor(Math.random() * 30) + 5; // Random review count between 5 and 35
  
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={mentor.profileImage || undefined} alt={`${mentor.firstName} ${mentor.lastName}`} />
              <AvatarFallback className="bg-primary-light text-white">
                {mentor.firstName?.[0]}{mentor.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium">{mentor.firstName} {mentor.lastName}</h3>
              <p className="text-sm text-muted-foreground">{mentor.title || "Mentor"}</p>
              <div className="flex items-center mt-1">
                <div className="flex mr-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < Math.floor(rating) ? "fill-accent text-accent" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{rating} ({reviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm mb-3">
            {mentor.bio || `${mentor.firstName} is an experienced professional offering mentorship in various areas.`}
          </p>
          
          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Specialties</h4>
          <div className="flex flex-wrap gap-1 mb-4">
            {mentor.specialties && Array.isArray(mentor.specialties) && mentor.specialties.length > 0 ? (
              mentor.specialties.map((specialty, index) => (
                <span key={index} className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                  {specialty}
                </span>
              ))
            ) : (
              <>
                <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                  Career Growth
                </span>
                <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                  Leadership
                </span>
              </>
            )}
          </div>
          
          <Button 
            className="w-full"
            onClick={handleConnectClick}
          >
            Schedule Session
          </Button>
        </CardContent>
      </Card>
      
      {showModal && (
        <BookingModal
          mentor={mentor}
          isOpen={showModal}
          onClose={closeModal}
        />
      )}
    </>
  );
}

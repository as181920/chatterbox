class Room < ActiveRecord::Base
  attr_accessible :name, :password
  validates_presence_of   :name
  validates_uniqueness_of :name, :case_sensitive => true

  before_validation :generate_name, :encrypt_password
  before_save       :generate_sha1

  def has_password?(password)
    encrypt(password) == self.password
  end

  def to_param
    sha1
  end

  def log_message(user, message)
    MongoChat.log_chat(user.id, user.display_name, sha1, message)
  end

  def log_event(user, event)
    MongoChat.log_event(user.id, user.display_name, sha1, event.to_s)
  end

  def recent_chats
    MongoChat.recent_chats(sha1)
  end

  private

    def generate_name
      self.name = ActiveSupport::SecureRandom.hex(6) if name.blank?
    end

    def generate_sha1
      self.sha1 = Digest::SHA1.hexdigest(name)
    end

    def encrypt_password
      self.password = encrypt(password) unless password.blank?
    end

    def encrypt(text)
      Digest::SHA2.hexdigest(text)
    end
end

import React from 'react';
import { Alert, Image, Pressable, ScrollView, Share, StatusBar, Text, View } from 'react-native';
import { CustomHeader, ICON_TYPE, IconX } from '../../../../components';
import { colors, navigationStrings } from '../../../../constants';
import { styles } from './styles';

type Service = {
	id: string;
	providerName: string;
	title: string;
	duration: string;
	rating: string;
	price: string;
	description: string;
	imageUrl: string;
};

type CustomerServiceDetailsProps = {
	navigation: any;
	route?: { params?: { service?: Service } };
};

const FALLBACK_SERVICE: Service = {
	id: 'service',
	providerName: 'Apex Cleaners',
	title: 'Deep Home Cleaning',
	duration: '3 hrs',
	rating: '4.9',
	price: '$120',
	description: 'Comprehensive room-by-room sanitation, allergen reduction, and detail cleaning.',
	imageUrl: '',
};

export default function CustomerServiceDetails({ navigation, route }: CustomerServiceDetailsProps) {
	const service = route?.params?.service ?? FALLBACK_SERVICE;

	const shareService = async () => {
		await Share.share({ message: `${service.title} by ${service.providerName} - ${service.price}` });
	};

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" />

			<CustomHeader
				title={service.title}
				showBackButton
				onLeftPress={() => navigation.goBack()}
			/>

			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>


				<View style={styles.card}>
					<View style={styles.heroImageWrap}>
						{service.imageUrl ? <Image source={{ uri: service.imageUrl }} style={styles.heroImage} /> : <IconX name="image-outline" origin={ICON_TYPE.IONICONS} size={48} color={colors.grey[400]} />}
						<View style={styles.durationBadge}><IconX name="time-outline" origin={ICON_TYPE.IONICONS} size={14} color={colors.purple[700]} /><Text style={styles.badgeText}>Approx. {service.duration}</Text></View>
					</View>
					<Text
						style={styles.serviceTitle}
					>
						{service.title}
					</Text>
					<Text
						style={styles.description}
					>
						{service.description}
					</Text>
					<View
						style={styles.priceRow}
					>
						<View>
							<Text
								style={styles.caption}
							>
								Standard Rate
							</Text>
							<View
								style={styles.priceLine}
							>
								<Text
									style={styles.price}
								>
									{service.price}.00
								</Text>
								<Text
									style={styles.mutedText}
								>
									/ flat fee
								</Text>
							</View>
						</View>
						<View
							style={styles.feeBadge}
						>
							<IconX
								name="lock-closed-outline"
								origin={ICON_TYPE.IONICONS}
								size={14}
								color={colors.purple[700]}
							/>
							<Text
								style={styles.badgeText}
							>
								No hidden fees
							</Text>
						</View>
					</View>
				</View>

				<View
					style={styles.card}
				>
					<View
						style={styles.providerRow}
					>
						<View
							style={styles.providerAvatar}
						>
							<IconX
								name="person"
								origin={ICON_TYPE.IONICONS}
								size={24}
								color={colors.purple[700]}
							/>
						</View>
						<View
							style={styles.providerCopy}
						>
							<Text
								style={styles.providerName}
							>
								{service.providerName}
							</Text>
							<Text
								style={styles.mutedText}
							>
								Professional service provider
							</Text>
							<View
								style={styles.ratingRow}
							>
								<IconX
									name="star"
									origin={ICON_TYPE.IONICONS}
									size={14}
									color={colors.yellow[400]}
								/>
								<Text
									style={styles.ratingText}
								>
									{service.rating}
								</Text>
						
							</View>
						</View>
				
					</View>
				</View>

				<View
					style={styles.availability}
				>
					<View
						style={styles.availabilityIcon}
					>
						<IconX
							name="navigate"
							origin={ICON_TYPE.IONICONS}
							size={20}
							color={colors.purple[700]}
						/>
					</View>
					<View>
						<Text
							style={styles.availabilityTitle}
						>
							Service Availability
						</Text>
						<Text
							style={styles.mutedText}
						>
							Available across Austin area
						</Text>
					</View>
				</View>

				<View
					style={styles.card}
				>
					<View
						style={styles.reviewHeading}
					>
						<View>
							<Text
								style={styles.reviewTitle}
							>
								Customer Reviews
							</Text>
							<Text
								style={styles.mutedText}
							>
								Verified service bookings
							</Text>
						</View>
						<View
							style={styles.reviewScore}
						>
							<Text
								style={styles.score}
							>
								4.9
							</Text>
							<Text
								style={styles.mutedText}
							>
								/ 5
							</Text>
						</View>
					</View>
					<View
						style={styles.reviewCard}
					>
						<View
							style={styles.reviewTop}
						>
							<View
								style={styles.reviewer}
							>
								<Text
									style={styles.reviewerInitials}
								>
									SM
								</Text>
							</View>
							<Text
								style={styles.reviewerName}
							>
								Sarah M.
							</Text>
							<View
								style={styles.stars}
							>
								{[1, 2, 3, 4, 5].map(star =>
									<IconX
										key={star}
										name="star"
										origin={ICON_TYPE.IONICONS}
										size={14}
										color={colors.purple[700]}
									/>
								)}
							</View>
						</View>
						<Text
							style={styles.reviewText}
						>
							“John was punctual, meticulous, and made our kitchen sparkle like new. The smoothest booking experience.”
						</Text>
						<Text
							style={styles.caption}
						>
							2 days ago • Verified Homeowner
						</Text>
					</View>
				</View>
			</ScrollView>

			<View
				style={styles.bottomBar}
			>
				<View>
					<Text
						style={styles.caption}
					>
						TOTAL
					</Text>
					<Text
						style={styles.total}
					>
						{service.price}.00
					</Text>
				</View>
				<Pressable
					style={styles.bookButton}
					onPress={() => navigation.navigate(navigationStrings.CUSTOMER_BOOK_SERVICE, { service })}
				>
					<Text
						style={styles.bookText}
					>
						Book This Service
					</Text>
					<IconX
						name="arrow-forward"
						origin={ICON_TYPE.IONICONS}
						size={18}
						color={colors.white[100]}
					/>
				</Pressable>
			</View>
		</View>
	);
}

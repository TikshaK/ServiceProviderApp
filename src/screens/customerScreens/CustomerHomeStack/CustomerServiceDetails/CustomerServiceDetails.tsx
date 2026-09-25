import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Share, StatusBar, Text, TouchableOpacity, View } from 'react-native';
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
	imageUrls?: string[];
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
	imageUrls: [],
};

export default function CustomerServiceDetails({ navigation, route }: CustomerServiceDetailsProps) {
	const service = route?.params?.service ?? FALLBACK_SERVICE;
	const images = service.imageUrls && service.imageUrls.length > 0 ? service.imageUrls : [service.imageUrl || ''];

	const [activeIndex, setActiveIndex] = useState(0);
	const [previewVisible, setPreviewVisible] = useState(false);

	const shareService = async () => {
		await Share.share({ message: `${service.title} by ${service.providerName} - ${service.price}` });
	};


	console.log("Images array:", images)


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
					<View style={styles.carouselWrap}>
						<ScrollView
							horizontal
							pagingEnabled
							showsHorizontalScrollIndicator={false}
							onMomentumScrollEnd={(event) => {
								const offsetX = event.nativeEvent.contentOffset.x;
								const index = Math.round(offsetX / event.nativeEvent.layoutMeasurement.width);
								setActiveIndex(index);
							}}
							scrollEventThrottle={16}>
							{images.map((img, index) => {
								console.log("Image item:", img)
								return (
									<View
										key={index}
										style={styles.carouselImageContainer}
									>
										{img
											?
											<Image
												source={{ uri: img }}
												style={styles.carouselImage}
												resizeMode="cover"
											/>
											:
											<IconX
												name="image-outline"
												origin={ICON_TYPE.IONICONS}
												size={48}
												color={colors.grey[400]}
											/>}
									</View>
								)
							})}
						</ScrollView>

						{images.length > 1 && (
							<View style={styles.carouselDots}>
								{images.map((_, index) => (
									<View
										key={index}

										style={[
											styles.dot,
											index === activeIndex ?
												styles.dotActive :
												styles.dotInactive
										]}
									/>
								))}
							</View>
						)}
						<Pressable onPress={() => setPreviewVisible(true)}>
							<View style={styles.durationBadge}>
								<IconX
									name="time-outline"
									origin={ICON_TYPE.IONICONS}
									size={14}
									color={colors.purple[700]}
								/>
								<Text style={styles.badgeText}>
									Approx. {service.duration}
								</Text>
							</View>
						</Pressable>
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
						<Text
							style={styles.reviewTitle}
						>
							Customer Reviews
						</Text>
					</View>
					<View
						style={styles.reviewCard}
					>
						<Text style={styles.mutedText}>No reviews yet</Text>
					</View>
				</View>
			</ScrollView>

			<Modal
				visible={previewVisible}
				transparent={false}
				animationType="fade"
				statusBarTranslucent
				onRequestClose={() => setPreviewVisible(false)}
			>
				<View style={{ flex: 1, backgroundColor: colors.black[500] }}>
					<StatusBar barStyle="light-content" backgroundColor={colors.black[500]} />
					<ScrollView
						horizontal
						pagingEnabled
						showsHorizontalScrollIndicator={false}
						style={{ flex: 1 }}
						onMomentumScrollEnd={(event) => {
							const offsetX = event.nativeEvent.contentOffset.x;
							const index = Math.round(offsetX / event.nativeEvent.layoutMeasurement.width);
							setActiveIndex(index);
						}}
						scrollEventThrottle={16}>
						{images.map((img, index) => (
							<View
								key={index}
								style={{
									flex: 1,
									justifyContent: 'center',
									alignItems: 'center',
									backgroundColor: colors.black[500]
								}}>
								{img
									?
									<Image
										source={{ uri: img }}
										style={{
											flex: 1,
											width: undefined,
											height: undefined,
											resizeMode: 'contain'
										}}
									/>
									:
									<IconX
										name="image-outline"
										origin={ICON_TYPE.IONICONS}
										size={48}
										color={colors.grey[400]}
									/>
								}
							</View>
						))}
					</ScrollView>
					<TouchableOpacity
						style={{ position: 'absolute', right: 16, top: 40, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
						onPress={() => setPreviewVisible(false)}
						activeOpacity={0.8}
					>
						<IconX name="close" size={26} color={colors.white[100]} origin={ICON_TYPE.IONICONS} />
					</TouchableOpacity>
					{images.length > 1 && (
						<View style={{ position: 'absolute', alignSelf: 'center', bottom: 30, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.55)' }}>
							<Text style={{ color: colors.white[100], fontSize: 14 }}>{activeIndex + 1} / {images.length}</Text>
						</View>
					)}
				</View>
			</Modal>

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
